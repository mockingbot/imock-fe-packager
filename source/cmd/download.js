import { resolve } from 'path'
import { unlinkSync, readFileSync, writeFileSync } from 'fs'
import { binary as formatBinary, stringIndentLine } from 'dr-js/module/common/format'
import { FILE_TYPE, getPathType } from 'dr-js/module/node/file/File'
import { doTarExtract, checkPackageHash } from './__utils__'

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
  if (await getPathType(resolve(pathUnpack, 'PACKAGE_HASH')) === FILE_TYPE.File) {
    await checkPackageHash(pathUnpack, JSON.parse(readFileSync(resolve(pathUnpack, 'PACKAGE_HASH'))))
    console.log(`[Download] checked package hash`)
  } else console.warn(`[WARNING][Download] skipped hash check`)
  console.log(`[Download] PACKAGE_INFO:\n${stringIndentLine(readFileSync(resolve(pathUnpack, 'PACKAGE_INFO'), 'utf8'), '  ')}`)
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

export {
  doDownload,
  doDownloadFile
}
