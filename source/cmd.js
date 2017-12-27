import nodeModulePath from 'path'
import nodeModuleFs from 'fs'
import { promisify } from 'util'
import * as Format from 'dr-js/module/common/format'
import { runCommand } from 'dr-js/module/node/module'

const unlink = promisify(nodeModuleFs.unlink)
const readFile = promisify(nodeModuleFs.readFile)
const writeFile = promisify(nodeModuleFs.writeFile)

const getGitBranch = async () => (await runCommand('git symbolic-ref --short HEAD')).stdoutString.replace('\n', '')
const getGitCommitHash = async () => (await runCommand('git log -1 --format="%H"')).stdoutString.replace('\n', '')

const doTarCompress = async (sourcePath = './', outputFileName = 'pack.tar.gz') => runCommand(`tar -czf "${outputFileName}" -C "${sourcePath}" .`)

const doTarExtract = async (sourceFileName = 'pack.tar.gz', outputPath = './') => runCommand(`tar --strip-components 1 -xzf "${sourceFileName}" -C "${outputPath}"`)

const doList = async (AWSInstance) => {
  const contentList = await AWSInstance.downloadBufferList()
  contentList.forEach((v) => (v.LastModifiedDate = new Date(v.LastModified)))
  contentList.sort((a, b) => (b.LastModifiedDate - a.LastModifiedDate)) // bigger time first
  const listOutputTable = contentList.map(({ Key, Size, LastModifiedDate, ETag }) => [ LastModifiedDate.toISOString(), `${Format.binary(Size)}B`, Key, ETag ])
  listOutputTable.unshift([ 'LastModifiedDate', 'Size', 'Key', 'ETag' ])
  console.log(`[List]\n${Format.stringIndentLine(Format.padTable({ table: listOutputTable, cellPad: ' | ', padFuncList }), '  ')}`)
}

const padFuncEnd = (source, maxWidth) => source.padEnd(maxWidth)
const padFuncList = [ padFuncEnd, padFuncEnd, padFuncEnd, padFuncEnd ]

const doUpload = async (AWSInstance, { pathPack, nameFileTarGz, nameFileLatestTarGz, packageInfoString }) => {
  await writeFile(nodeModulePath.join(pathPack, 'PACKAGE_INFO'), packageInfoString)
  await doTarCompress(pathPack, nameFileTarGz)
  const buffer = await readFile(nameFileTarGz)
  console.log(`[Upload] packed from '${pathPack}', size: ${Format.binary(buffer.length)}B`)
  await AWSInstance.uploadBufferToBucket(nameFileTarGz, buffer)
  await AWSInstance.duplicateBufferInBucket(nameFileLatestTarGz, nameFileTarGz)
  await unlink(nameFileTarGz)
  console.log(`[Upload] uploaded '${nameFileTarGz}' and '${nameFileLatestTarGz}'`)
}

const doDownload = async (AWSInstance, { nameFileTarGz, pathUnpack }) => {
  let buffer = null
  try {
    buffer = await AWSInstance.downloadBufferFromBucket(nameFileTarGz)
    console.log(`[Download] downloaded '${nameFileTarGz}', size: ${Format.binary(buffer.length)}B`)
  } catch (error) { throw new Error(`[Download] failed to get file: '${nameFileTarGz}', error: ${error.message}`) }
  await writeFile(nameFileTarGz, buffer)
  await doTarExtract(nameFileTarGz, pathUnpack)
  await unlink(nameFileTarGz)
  console.log(`[Download] unpacked to '${pathUnpack}'`)
  console.log(`[Download] PACKAGE_INFO:\n${Format.stringIndentLine(await readFile(nodeModulePath.join(pathUnpack, 'PACKAGE_INFO'), 'utf8'), '  ')}`)
}

export {
  getGitBranch,
  getGitCommitHash,

  doList,
  doUpload,
  doDownload
}
