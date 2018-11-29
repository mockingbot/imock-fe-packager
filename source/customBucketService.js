import { join, relative } from 'path'
import { ACCESS_TYPE } from 'bucket-sdk'
import { catchAsync } from 'dr-js/module/common/error'
import { toPosixPath } from 'dr-js/module/node/file/function'
import { fileUpload, fileDownload, pathAction } from 'dr-server/module/featureNode/explorer'

const connectCustomBucket = async ({
  fileAuth,
  urlPathAction,
  urlFileUpload,
  urlFileDownload,
  timeout,
  bucket
}) => {
  const getBufferList = async (keyPrefix = '', maxKey) => {
    maxKey && console.warn(`[getBufferList] CustomBucket do not support maxKey`)
    const { resultList: [ { relativeFrom, fileList } ] } = await pathAction({ actionType: 'list-file-recursive', key: `${bucket}/${keyPrefix}`, urlPathAction, fileAuth, timeout })
    __DEV__ && console.log(`[getBufferList]`, { relativeFrom, fileList })
    const bufferList = fileList.map(([ name, size, mTimeMs ]) => ({ key: toPosixPath(relative(bucket, join(relativeFrom, name))), eTag: '-', size, lastModified: mTimeMs }))
    __DEV__ && console.log(`[getBufferList] downloaded buffer list. length: ${bufferList.length}`)
    return { bufferList } // [ {  key, eTag, size, lastModified } ]
  }
  const getBuffer = async (key) => {
    const buffer = await fileDownload({ filePath: `${bucket}/${key}`, urlFileDownload, fileAuth, timeout })
    return { key, buffer }
  }
  const putBuffer = async (key, buffer, accessType = ACCESS_TYPE.PRIVATE) => {
    accessType !== ACCESS_TYPE.PRIVATE && console.warn(`[putBuffer] CustomBucket accessType support private only`)
    await fileUpload({ fileBuffer: buffer, filePath: `${bucket}/${key}`, urlFileUpload, fileAuth, timeout })
    return { key }
  }
  const copyBuffer = async (key, sourceInfo, accessType = ACCESS_TYPE.PRIVATE) => {
    accessType !== ACCESS_TYPE.PRIVATE && console.warn(`[copyBuffer] CustomBucket accessType support private only`)
    await pathAction({ actionType: 'copy', key: `${bucket}/${sourceInfo.key}`, keyTo: `${bucket}/${key}`, urlPathAction, fileAuth, timeout })
  }
  const deleteBuffer = async (key) => {
    await pathAction({ actionType: 'delete', key: `${bucket}/${key}`, urlPathAction, fileAuth, timeout })
  }
  const deleteBufferList = async (keyList) => {
    const { errorList } = await catchAsync(pathAction, { actionType: 'delete', nameList: keyList, key: bucket, urlPathAction, fileAuth, timeout })
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
