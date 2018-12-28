import { resolve } from 'path'
import { unlinkSync, readFileSync, writeFileSync } from 'fs'
import { binary } from 'dr-js/module/common/format'
import { indentLine } from 'dr-js/module/common/string'
import { readableAsync } from 'dr-js/module/node/file/function'
import { doTarExtract, checkPackageHash } from './__utils__'

const doDownload = async (bucketService, { nameFileTarGz, pathUnpack }, log) => {
  let buffer = null
  try {
    const { buffer: remoteBuffer } = await bucketService.getBuffer(nameFileTarGz)
    log(`[Download] downloaded '${nameFileTarGz}', size: ${binary(remoteBuffer.length)}B`)
    buffer = remoteBuffer
  } catch (error) {
    console.warn(error)
    throw new Error(`[Download] failed to get file: '${nameFileTarGz}', error: ${error.message}`)
  }
  writeFileSync(nameFileTarGz, buffer)
  await doTarExtract(nameFileTarGz, pathUnpack)
  unlinkSync(nameFileTarGz)
  log(`[Download] unpacked package to '${pathUnpack}'`)
  if (await readableAsync(resolve(pathUnpack, 'PACKAGE_HASH'))) {
    await checkPackageHash(pathUnpack, JSON.parse(readFileSync(resolve(pathUnpack, 'PACKAGE_HASH'))))
    log(`[Download] checked package hash`)
  } else console.warn(`[WARNING][Download] skipped hash check`)
  log(`[Download] PACKAGE_INFO:\n${indentLine(readFileSync(resolve(pathUnpack, 'PACKAGE_INFO'), 'utf8'), '  ')}`)
}

const doDownloadFile = async (bucketService, { pathFile, keyFile }, log) => {
  let buffer = null
  try {
    const { buffer: remoteBuffer } = await bucketService.getBuffer(keyFile)
    log(`[Download] downloaded '${keyFile}', size: ${binary(remoteBuffer.length)}B`)
    buffer = remoteBuffer
  } catch (error) {
    console.warn(error)
    throw new Error(`[Download] failed to get file: '${keyFile}', error: ${error.message}`)
  }
  writeFileSync(pathFile, buffer)
  log(`[Download] saved to '${pathFile}'`)
}

export {
  doDownload,
  doDownloadFile
}
