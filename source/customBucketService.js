import { join, relative } from 'path'
import { ACCESS_TYPE } from 'bucket-sdk'
import { toPosixPath } from 'dr-js/module/node/file/function'
import { PATH_ACTION_TYPE } from 'dr-server/module/feature/Explorer/task/pathAction'
import { getAuthFetch, fileUpload, fileDownload, pathAction } from 'dr-server/module/featureNode/explorer'

const connectCustomBucket = async ({
  fileAuth,
  authKey,
  urlPathAction,
  urlFileUpload,
  urlFileDownload,
  timeout,
  bucket
}) => {
  const authFetch = await getAuthFetch({ fileAuth, authKey })

  const getBufferList = async (keyPrefix = '', maxKey) => {
    maxKey && console.warn(`[getBufferList] CustomBucket do not support maxKey`)
    const { resultList: [ { relativeFrom, fileList } ] } = await pathAction({
      actionType: PATH_ACTION_TYPE.DIRECTORY_ALL_FILE_LIST,
      key: `${bucket}/${keyPrefix}`,
      urlPathAction,
      authFetch,
      timeout
    })
    __DEV__ && console.log(`[getBufferList]`, { relativeFrom, fileList })
    const bufferList = fileList.map(([ name, size, mTimeMs ]) => ({ key: toPosixPath(relative(bucket, join(relativeFrom, name))), eTag: '-', size, lastModified: mTimeMs }))
    __DEV__ && console.log(`[getBufferList] downloaded buffer list. length: ${bufferList.length}`)
    return { bufferList } // [ {  key, eTag, size, lastModified } ]
  }
  const getBuffer = async (key) => {
    const buffer = await fileDownload({
      filePath: `${bucket}/${key}`,
      urlFileDownload,
      authFetch,
      timeout
    })
    return { key, buffer }
  }
  const putBuffer = async (key, buffer, accessType = ACCESS_TYPE.PRIVATE) => {
    accessType !== ACCESS_TYPE.PRIVATE && console.warn(`[putBuffer] CustomBucket accessType support private only`)
    await fileUpload({
      fileBuffer: buffer,
      filePath: `${bucket}/${key}`,
      urlFileUpload,
      authFetch,
      timeout
    })
    return { key }
  }
  const copyBuffer = async (key, sourceInfo, accessType = ACCESS_TYPE.PRIVATE) => {
    accessType !== ACCESS_TYPE.PRIVATE && console.warn(`[copyBuffer] CustomBucket accessType support private only`)
    await pathAction({
      actionType: PATH_ACTION_TYPE.PATH_COPY,
      key: `${bucket}/${sourceInfo.key}`,
      keyTo: `${bucket}/${key}`,
      urlPathAction,
      authFetch,
      timeout
    })
  }
  const deleteBuffer = async (key) => pathAction({
    actionType: PATH_ACTION_TYPE.PATH_DELETE,
    key: `${bucket}/${key}`,
    urlPathAction,
    authFetch,
    timeout
  })
  const deleteBufferList = async (keyList) => pathAction({
    actionType: PATH_ACTION_TYPE.PATH_DELETE,
    nameList: keyList,
    key: bucket,
    urlPathAction,
    authFetch,
    timeout
  })

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
