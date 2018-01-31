import { join as joinPath } from 'path'
import { execSync, spawnSync } from 'child_process'
import { unlinkSync, readFileSync, writeFileSync } from 'fs'
import { binary as formatBinary, stringIndentLine, padTable } from 'dr-js/module/common/format'

const DEFAULT_EXEC_OPTION = { stdio: 'inherit', shell: true }

const getGitBranch = () => execSync('git symbolic-ref --short HEAD').toString().replace(/\s/g, '')
const getGitCommitHash = () => execSync('git log -1 --format="%H"').toString().replace(/\s/g, '')

const doTarCompress = (sourcePath, outputFileName) => spawnSync('tar', [ '-czf', outputFileName, '-C', sourcePath, '.' ], DEFAULT_EXEC_OPTION)
const doTarExtract = (sourceFileName, outputPath) => spawnSync('tar', [ '--strip-components', '1', '-xzf', sourceFileName, '-C', outputPath ], DEFAULT_EXEC_OPTION)

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

const doUpload = async (bucketService, { pathPack, nameFileTarGz, nameFileLatestTarGz, packageInfoString }) => {
  writeFileSync(joinPath(pathPack, 'PACKAGE_INFO'), packageInfoString)
  doTarCompress(pathPack, nameFileTarGz)
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
  doTarExtract(nameFileTarGz, pathUnpack)
  unlinkSync(nameFileTarGz)
  console.log(`[Download] unpacked to '${pathUnpack}'`)
  console.log(`[Download] PACKAGE_INFO:\n${stringIndentLine(readFileSync(joinPath(pathUnpack, 'PACKAGE_INFO'), 'utf8'), '  ')}`)
}

export {
  getGitBranch,
  getGitCommitHash,

  doList,
  doUpload,
  doDownload
}
