import { execSync } from 'child_process'
import { join as joinPath, relative } from 'path'
import { unlinkSync, readFileSync, writeFileSync } from 'fs'
import { binary as formatBinary, stringIndentLine, padTable } from 'dr-js/module/common/format'
import { FILE_TYPE, getPathType } from 'dr-js/module/node/file/File'
import { getFileList } from 'dr-js/module/node/file/Directory'
import { spawn } from 'dr-js/module/node/module/Command'
import { getEntityTagByContentHash } from 'dr-js/module/node/module/EntityTag'

const getGitBranch = () => execSync('git symbolic-ref --short HEAD').toString().replace(/\s/g, '')
const getGitCommitHash = () => execSync('git log -1 --format="%H"').toString().replace(/\s/g, '')

const doTarCompress = async (sourcePath, outputFileName) => spawn('tar', [ '-czf', outputFileName, '-C', sourcePath, '.' ]).promise
const doTarExtract = async (sourceFileName, outputPath) => spawn('tar', [ '--strip-components', '1', '-xzf', sourceFileName, '-C', outputPath ]).promise

const doList = async (bucketService) => {
  const contentList = await bucketService.getBufferList()
  contentList.forEach((v) => (v.LastModifiedDate = new Date(v.LastModified)))
  contentList.sort((a, b) => (b.LastModifiedDate - a.LastModifiedDate)) // bigger time first
  const listOutputTable = contentList.map(({ Key, Size, LastModifiedDate, ETag }) => [ LastModifiedDate.toISOString(), `${formatBinary(Size)}B`, Key, ETag ])
  listOutputTable.unshift([ 'LastModifiedDate', 'Size', 'Key', 'ETag' ])
  console.log(`[List]\n${stringIndentLine(padTable({ table: listOutputTable, cellPad: ' | ', padFuncList }), '  ')}`)
}

const padFuncEnd = (source, maxWidth) => source.padEnd(maxWidth)
const padFuncList = [ padFuncEnd, padFuncEnd, padFuncEnd, padFuncEnd ]

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

const doUpload = async (bucketService, { pathPack, nameFileTarGz, nameFileLatestTarGz, packageInfoString }) => {
  writeFileSync(joinPath(pathPack, 'PACKAGE_INFO'), packageInfoString)
  console.log(`[Upload] collected package info`)
  writeFileSync(joinPath(pathPack, 'PACKAGE_HASH'), JSON.stringify(await collectPackageHash(pathPack)))
  console.log(`[Upload] collected package hash`)
  await doTarCompress(pathPack, nameFileTarGz)
  const buffer = readFileSync(nameFileTarGz)
  console.log(`[Upload] packed from '${pathPack}', size: ${formatBinary(buffer.length)}B`)
  const bufferInfo = await bucketService.putBuffer(nameFileTarGz, buffer)
  await bucketService.copyBuffer(nameFileLatestTarGz, bufferInfo)
  unlinkSync(nameFileTarGz)
  console.log(`[Upload] uploaded '${nameFileTarGz}' and '${nameFileLatestTarGz}'`)
}

const doDownload = async (bucketService, { nameFileTarGz, pathUnpack }) => {
  let buffer = null
  try {
    buffer = await bucketService.getBuffer(nameFileTarGz)
    console.log(`[Download] downloaded '${nameFileTarGz}', size: ${formatBinary(buffer.length)}B`)
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

export {
  getGitBranch,
  getGitCommitHash,

  doList,
  doUpload,
  doDownload
}
