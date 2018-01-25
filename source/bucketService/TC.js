import TC_SDK from 'cos-nodejs-sdk-v5' // TenCent Cloud

const connectTcBucket = async ({ appId, secretId, secretKey, region, bucket }) => {
  let tcService
  const bucketName = `${bucket}-${appId}`

  try {
    tcService = new TC_SDK({ SecretId: secretId, SecretKey: secretKey })
  } catch (error) {
    console.warn(error)
    throw new Error(`[connectTcBucket] failed to load TC_SDK. region: ${region}, bucket: ${bucket}`)
  }

  const { isExist, isAuth } = await checkTcBucket(tcService, region, bucketName)
  if (!isExist || !isAuth) throw new Error(`[connectTcBucket] bucket not found with name: ${bucket}`)
  console.log(`[connectTcBucket] selected region: ${region}, bucket: ${bucket}`)

  const getBufferList = async () => {
    const { objectList } = await getTcObjectList(tcService, region, bucketName)
    __DEV__ && console.log(`[getBufferList] downloaded buffer list. length: ${objectList.length}`)
    return objectList // [ { Key, Size, LastModified, ETag, Owner, StorageClass } ]
  }
  const getBuffer = async (key) => {
    const { buffer } = await getTcObject(tcService, region, bucketName, key)
    __DEV__ && console.log(`[getBuffer] downloaded buffer.`)
    return buffer
  }
  const putBuffer = async (key, buffer) => {
    const { eTag, url } = await putTcObject(tcService, region, bucketName, key, buffer)
    __DEV__ && console.log(`[putBuffer] uploaded buffer. eTag: ${eTag}, url: ${url}`)
    return { key, eTag, url }
  }
  const copyBuffer = async (key, sourceInfo) => {
    const sourceObjectUrl = sourceInfo.url.replace(/^\w+:\/\//, '') // TODO: STRANGE: must remove protocol
    const { copyObjectETag } = await copyTcObject(tcService, region, bucketName, key, sourceObjectUrl)
    __DEV__ && console.log(`[copyBuffer] copied buffer. copyObjectETag: ${copyObjectETag}, sourceObjectUrl: ${sourceObjectUrl}`)
  }

  return { getBufferList, getBuffer, putBuffer, copyBuffer }
}

// check: https://cloud.tencent.com/document/product/436/8629
const checkTcBucket = (tcService, region, bucketName) => new Promise((resolve, reject) => tcService.headBucket(
  { Region: region, Bucket: bucketName },
  (error, result) => {
    if (error) return reject(error)
    // __DEV__ && console.log('[checkTcBucket]', result)
    const { BucketExist: isExist, BucketAuth: isAuth } = result
    resolve({ isExist, isAuth })
  }
))
const getTcObjectList = (tcService, region, bucketName) => new Promise((resolve, reject) => tcService.getBucket(
  { Region: region, Bucket: bucketName, MaxKeys: '512' },
  (error, result) => {
    if (error) return reject(error)
    // __DEV__ && console.log('[getTcObjectList]', result)
    const { Contents: objectList } = result
    resolve({ objectList })
  }
))
const getTcObject = (tcService, region, bucketName, key) => new Promise((resolve, reject) => tcService.getObject(
  { Region: region, Bucket: bucketName, Key: key },
  (error, result) => {
    if (error) return reject(error)
    // __DEV__ && console.log('[getTcObject]', result)
    const { Body: body } = result
    const buffer = Buffer.isBuffer(body) ? body : Buffer.from(body) // body might be Buffer, according to Doc: (Buffer, Typed Array, Blob, String, ReadableStream) Object data
    resolve({ buffer })
  }
))
const putTcObject = (tcService, region, bucketName, key, buffer) => new Promise((resolve, reject) => tcService.putObject(
  { Region: region, Bucket: bucketName, Key: key, Body: buffer, ACL: 'private' },
  (error, result) => {
    if (error) return reject(error)
    // __DEV__ && console.log('[putTcObject]', result)
    const { ETag: eTag, Location: url } = result
    resolve({ eTag, url })
  }
))
const copyTcObject = (tcService, region, bucketName, key, sourceObjectUrl) => new Promise((resolve, reject) => tcService.putObjectCopy(
  { Region: region, Bucket: bucketName, Key: key, CopySource: sourceObjectUrl, ACL: 'private' },
  (error, result) => {
    if (error) return reject(error)
    // __DEV__ && console.log('[copyTcObject]', result)
    const { ETag: copyObjectETag } = result
    resolve({ copyObjectETag })
  }
))

export { connectTcBucket }
