import { join, relative } from 'path'
import { ACCESS_TYPE } from 'bucket-sdk'
import { catchAsync } from 'dr-js/module/common/error'
import { toPosixPath } from 'dr-js/module/node/file/function'
import { clientFileUpload, clientFileDownload, clientFileModify } from 'dr-server/module/clientFile'

const connectCustomBucket = async ({
  fileAuthConfig: fileAuth,
  urlFileModify,
  urlFileUpload,
  urlFileDownload,
  bucket
}) => {
  const getBufferList = async (keyPrefix = '', maxKey) => {
    maxKey && console.warn(`[getBufferList] CustomBucket do not support maxKey`)
    const { relativePathFrom, fileList } = await clientFileModify({ modifyType: 'list-file-recursive', filePath: `${bucket}/${keyPrefix}`, urlFileModify, fileAuth })
    __DEV__ && console.log(`[getBufferList]`, { relativePathFrom, fileList })
    const bufferList = fileList.map(([ name, size, mTimeMs ]) => ({ key: toPosixPath(relative(bucket, join(relativePathFrom, name))), eTag: '-', size, lastModified: mTimeMs }))
    __DEV__ && console.log(`[getBufferList] downloaded buffer list. length: ${bufferList.length}`)
    return { bufferList } // [ {  key, eTag, size, lastModified } ]
  }
  const getBuffer = async (key) => {
    const buffer = await clientFileDownload({ filePath: `${bucket}/${key}`, urlFileDownload, fileAuth })
    return { key, buffer }
  }
  const putBuffer = async (key, buffer, accessType = ACCESS_TYPE.PRIVATE) => {
    accessType !== ACCESS_TYPE.PRIVATE && console.warn(`[putBuffer] CustomBucket accessType support private only`)
    await clientFileUpload({ fileBuffer: buffer, filePath: `${bucket}/${key}`, urlFileUpload, fileAuth })
    return { key }
  }
  const copyBuffer = async (key, sourceInfo, accessType = ACCESS_TYPE.PRIVATE) => {
    accessType !== ACCESS_TYPE.PRIVATE && console.warn(`[copyBuffer] CustomBucket accessType support private only`)
    await clientFileModify({ modifyType: 'copy', filePath: `${bucket}/${sourceInfo.key}`, filePathTo: `${bucket}/${key}`, urlFileModify, fileAuth })
  }
  const deleteBuffer = async (key) => {
    await clientFileModify({ modifyType: 'delete', filePath: `${bucket}/${key}`, urlFileModify, fileAuth })
  }
  const deleteBufferList = async (keyList) => {
    const errorList = []
    for (const key of keyList) {
      const { error } = await catchAsync(clientFileModify, { modifyType: 'delete', filePath: `${bucket}/${key}`, urlFileModify, fileAuth })
      error && errorList.push({ key, error, message: error.toString() })
    }
    __DEV__ && console.log(`[deleteBufferList] deleted buffer list, length of errorList: ${errorList.length}`)
    return { errorList }
  }

  return {
    getBufferList,
    getBuffer,
    putBuffer,
    copyBuffer,
    deleteBuffer,
    deleteBufferList
  }
}

export { connectCustomBucket }
