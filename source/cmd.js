import { execSync } from 'child_process'
import { join as joinPath, relative } from 'path'
import { unlinkSync, readFileSync, writeFileSync } from 'fs'
import { ACCESS_TYPE } from 'bucket-sdk'
import { binary as formatBinary, stringIndentLine, padTable } from 'dr-js/module/common/format'
import { FILE_TYPE, getPathType } from 'dr-js/module/node/file/File'
import { getFileList } from 'dr-js/module/node/file/Directory'
import { spawn } from 'dr-js/module/node/module/Command'
import { getEntityTagByContentHash } from 'dr-js/module/node/module/EntityTag'

const getGitBranch = () => execSync('git symbolic-ref --short HEAD').toString().replace(/\s/g, '')
const getGitCommitHash = () => execSync('git log -1 --format="%H"').toString().replace(/\s/g, '')

const doTarCompress = async (sourcePath, outputFileName) => spawn('tar', [ '-czf', outputFileName, '-C', sourcePath, '.' ]).promise
const doTarExtract = async (sourceFileName, outputPath) => spawn('tar', [ '--strip-components', '1', '-xzf', sourceFileName, '-C', outputPath ]).promise

const doList = async (bucketService, { listKeyPrefix = '' }) => {
  const { bufferList } = await bucketService.getBufferList(listKeyPrefix)
  bufferList.forEach((v) => (v.lastModifiedDate = new Date(v.lastModified)))
  bufferList.sort((a, b) => (b.lastModifiedDate - a.lastModifiedDate)) // bigger time first
  console.log(`[List] listKeyPrefix '${listKeyPrefix}'\n${stringIndentLine(padTable({
    table: [
      [ 'LastModifiedDate', 'Size', 'Key', 'ETag' ],
      ...bufferList.map(({ lastModifiedDate, size, key, eTag }) => [
        lastModifiedDate.toISOString(), `${formatBinary(size)}B`, key, eTag
      ])
    ],
    padFuncList: [ 'L', 'R', 'L', 'L' ],
    cellPad: ' | '
  }), '  ')}`)
}

const collectPackageHash = async (pathPackage) => {
  const packageHash = []
  for (const filePath of await getFileList(pathPackage)) {
    if (filePath.endsWith('PACKAGE_HASH')) continue
    const path = relative(pathPackage, filePath)
    const hash = getEntityTagByContentHash(readFileSync(filePath))
    packageHash.push([ path, hash ])
  }
  return packageHash
}
const checkPackageHash = async (pathPackage, packageHash) => {
  for (const [ path, hash ] of packageHash) {
    const filePath = joinPath(pathPackage, path)
    const checkHash = getEntityTagByContentHash(readFileSync(filePath))
    if (checkHash !== hash) throw new Error(`[checkPackageHash] expect file "${filePath}" hash to be: ${hash}, get: ${checkHash}`)
  }
}

const doUpload = async (bucketService, { pathPack, nameFileTarGz, nameFileLatestTarGz, packageInfoString, uploadPublicReadAccess }) => {
  writeFileSync(joinPath(pathPack, 'PACKAGE_INFO'), packageInfoString)
  console.log(`[Upload] collected package info`)
  writeFileSync(joinPath(pathPack, 'PACKAGE_HASH'), JSON.stringify(await collectPackageHash(pathPack)))
  console.log(`[Upload] collected package hash`)
  await doTarCompress(pathPack, nameFileTarGz)
  const buffer = readFileSync(nameFileTarGz)
  console.log(`[Upload] packed from '${pathPack}', size: ${formatBinary(buffer.length)}B`)
  const bufferInfo = await bucketService.putBuffer(nameFileTarGz, buffer, uploadPublicReadAccess ? ACCESS_TYPE.PUBLIC_READ : ACCESS_TYPE.PRIVATE)
  await bucketService.copyBuffer(nameFileLatestTarGz, bufferInfo, uploadPublicReadAccess ? ACCESS_TYPE.PUBLIC_READ : ACCESS_TYPE.PRIVATE)
  unlinkSync(nameFileTarGz)
  console.log(`[Upload] uploaded '${nameFileTarGz}' and '${nameFileLatestTarGz}'`)
}

const doUploadFile = async (bucketService, { pathFile, keyFile, uploadPublicReadAccess }) => {
  const buffer = readFileSync(pathFile)
  console.log(`[Upload] packed from '${pathFile}', size: ${formatBinary(buffer.length)}B`)
  const bufferInfo = await bucketService.putBuffer(keyFile, buffer, uploadPublicReadAccess ? ACCESS_TYPE.PUBLIC_READ : ACCESS_TYPE.PRIVATE)
  console.log(`[Upload] uploaded '${keyFile}'(${bufferInfo.eTag})`)
  return bufferInfo
}

const doDownload = async (bucketService, { nameFileTarGz, pathUnpack }) => {
  let buffer = null
  try {
    const { buffer: remoteBuffer } = await bucketService.getBuffer(nameFileTarGz)
    console.log(`[Download] downloaded '${nameFileTarGz}', size: ${formatBinary(remoteBuffer.length)}B`)
    buffer = remoteBuffer
  } catch (error) {
    console.warn(error)
    throw new Error(`[Download] failed to get file: '${nameFileTarGz}', error: ${error.message}`)
  }
  writeFileSync(nameFileTarGz, buffer)
  await doTarExtract(nameFileTarGz, pathUnpack)
  unlinkSync(nameFileTarGz)
  console.log(`[Download] unpacked package to '${pathUnpack}'`)
  if (await getPathType(joinPath(pathUnpack, 'PACKAGE_HASH')) === FILE_TYPE.File) {
    await checkPackageHash(pathUnpack, JSON.parse(readFileSync(joinPath(pathUnpack, 'PACKAGE_HASH'))))
    console.log(`[Download] checked package hash`)
  } else console.warn(`[WARNING][Download] skipped hash check`)
  console.log(`[Download] PACKAGE_INFO:\n${stringIndentLine(readFileSync(joinPath(pathUnpack, 'PACKAGE_INFO'), 'utf8'), '  ')}`)
}

const doDownloadFile = async (bucketService, { pathFile, keyFile }) => {
  let buffer = null
  try {
    const { buffer: remoteBuffer } = await bucketService.getBuffer(keyFile)
    console.log(`[Download] downloaded '${keyFile}', size: ${formatBinary(remoteBuffer.length)}B`)
    buffer = remoteBuffer
  } catch (error) {
    console.warn(error)
    throw new Error(`[Download] failed to get file: '${keyFile}', error: ${error.message}`)
  }
  writeFileSync(pathFile, buffer)
  console.log(`[Download] saved to '${pathFile}'`)
}

const DEFAULT_OUTDATED_TIME = 30 * 24 * 60 * 60 // 30 day, in seconds
const doDeleteOutdated = async (bucketService, { outdatedTime = DEFAULT_OUTDATED_TIME }) => {
  const maxDeleteTimestamp = Date.now() - outdatedTime * 1000
  const { bufferList } = await bucketService.getBufferList()
  const deleteKeyList = bufferList
    .filter((v) => (maxDeleteTimestamp >= new Date(v.lastModified).getTime()))
    .map(({ key }) => key)
  if (deleteKeyList.length) {
    await bucketService.deleteBufferList(deleteKeyList)
    console.log(`[DeleteOutdated] deleted ${deleteKeyList.length} outdated buffer since ${new Date(maxDeleteTimestamp).toISOString()}`)
  } else {
    console.log(`[DeleteOutdated] no outdated buffer since ${new Date(maxDeleteTimestamp).toISOString()}`)
  }
}

const doDeleteFile = async (bucketService, { keyFile }) => {
  await bucketService.deleteBuffer(keyFile)
  console.log(`[DeleteFile] deleted '${keyFile}'`)
}

export {
  getGitBranch,
  getGitCommitHash,

  doList,
  doUpload, doUploadFile,
  doDownload, doDownloadFile,
  doDeleteOutdated, doDeleteFile
}
