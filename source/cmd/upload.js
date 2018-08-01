import { resolve } from 'path'
import { unlinkSync, readFileSync, writeFileSync } from 'fs'
import { ACCESS_TYPE } from 'bucket-sdk'
import { binary } from 'dr-js/module/common/format'
import { doTarCompress, collectPackageHash } from './__utils__'

const doUpload = async (bucketService, { pathPack, nameFileTarGz, nameFileLatestTarGz, packageInfoString, uploadPublicReadAccess }, log) => {
  writeFileSync(resolve(pathPack, 'PACKAGE_INFO'), packageInfoString)
  log(`[Upload] collected package info`)

  writeFileSync(resolve(pathPack, 'PACKAGE_HASH'), JSON.stringify(await collectPackageHash(pathPack)))
  log(`[Upload] collected package hash`)

  await doTarCompress(pathPack, nameFileTarGz)
  const buffer = readFileSync(nameFileTarGz)
  log(`[Upload] packed from '${pathPack}', size: ${binary(buffer.length)}B`)

  const bufferInfo = await bucketService.putBuffer(nameFileTarGz, buffer, uploadPublicReadAccess ? ACCESS_TYPE.PUBLIC_READ : ACCESS_TYPE.PRIVATE)
  await bucketService.copyBuffer(nameFileLatestTarGz, bufferInfo, uploadPublicReadAccess ? ACCESS_TYPE.PUBLIC_READ : ACCESS_TYPE.PRIVATE)
  unlinkSync(nameFileTarGz)
  log(`[Upload] uploaded '${nameFileTarGz}' and '${nameFileLatestTarGz}'`)
}

const doUploadFile = async (bucketService, { pathFile, keyFile, uploadPublicReadAccess }, log) => {
  const buffer = readFileSync(pathFile)
  log(`[Upload] packed from '${pathFile}', size: ${binary(buffer.length)}B`)

  const bufferInfo = await bucketService.putBuffer(keyFile, buffer, uploadPublicReadAccess ? ACCESS_TYPE.PUBLIC_READ : ACCESS_TYPE.PRIVATE)
  log(`[Upload] uploaded '${keyFile}'(${bufferInfo.eTag})`)

  return bufferInfo
}

export {
  doUpload,
  doUploadFile
}
