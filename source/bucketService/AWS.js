import AWS_SDK from 'aws-sdk/global'
import AWS_SDK_S3 from 'aws-sdk/clients/s3'

const connectAwsBucket = async ({ accessKeyId, secretAccessKey, region, bucket }) => {
  let s3Service

  try {
    AWS_SDK.config.update({ accessKeyId, secretAccessKey, region })
    s3Service = new AWS_SDK_S3()
  } catch (error) {
    console.warn(error)
    throw new Error(`[connectAwsBucket] failed to load AWS_SDK_S3. region: ${region}, bucket: ${bucket}`)
  }

  const { bucketList } = await getS3BucketList(s3Service)
  if (!bucketList.find(({ Name }) => Name === bucket)) throw new Error(`[connectAwsBucket] bucket not found with name: ${bucket}`)
  console.log(`[connectAwsBucket] selected region: ${region}, bucket: ${bucket}`)

  const getBufferList = async () => {
    const { objectList } = await getS3ObjectList(s3Service, bucket)
    __DEV__ && console.log(`[getBufferList] downloaded buffer list. length: ${objectList.length}`)
    return objectList // [ { Key, Size, LastModified, ETag } ]
  }
  const getBuffer = async (key) => {
    const { buffer, eTag } = await getS3Object(s3Service, bucket, key)
    __DEV__ && console.log(`[getBuffer] downloaded buffer. eTag: ${eTag}`)
    return buffer
  }
  const putBuffer = async (key, buffer) => {
    const { eTag } = await putS3Object(s3Service, bucket, key, buffer)
    __DEV__ && console.log(`[putBuffer] uploaded buffer. eTag: ${eTag}`)
    return { key, eTag }
  }
  const copyBuffer = async (key, sourceInfo) => {
    const { copyObjectETag } = await copyS3Object(s3Service, bucket, key, bucket, sourceInfo.key)
    __DEV__ && console.log(`[copyBuffer] copied buffer. copyObjectETag: ${copyObjectETag}`)
  }

  return { getBufferList, getBuffer, putBuffer, copyBuffer }
}

// check: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html
const getS3BucketList = (s3Service) => new Promise((resolve, reject) => s3Service.listBuckets((error, result) => {
  if (error) return reject(error)
  // __DEV__ && console.log('[getS3BucketList]', result)
  const { Buckets: bucketList, Owner: ownerMap } = result
  resolve({ bucketList, ownerMap })
}))
const getS3ObjectList = (s3Service, bucketName) => new Promise((resolve, reject) => s3Service.listObjects(
  { Bucket: bucketName, MaxKeys: 512 },
  (error, result) => {
    if (error) return reject(error)
    // __DEV__ && console.log('[getS3ObjectList]', result)
    const { Contents: objectList } = result
    resolve({ objectList })
  }
))
const getS3Object = (s3Service, bucketName, key) => new Promise((resolve, reject) => s3Service.getObject(
  { Bucket: bucketName, Key: key },
  (error, result) => {
    if (error) return reject(error)
    // __DEV__ && console.log('[getS3Object]', result)
    const { Body: body, ETag: eTag } = result
    const buffer = Buffer.isBuffer(body) ? body : Buffer.from(body)
    resolve({ buffer, eTag })
  }
))
const putS3Object = (s3Service, bucketName, key, buffer) => new Promise((resolve, reject) => s3Service.putObject(
  { Bucket: bucketName, Key: key, Body: buffer },
  (error, result) => {
    if (error) return reject(error)
    // __DEV__ && console.log('[putS3Object]', result)
    const { ETag: eTag } = result
    resolve({ eTag })
  }
))
const copyS3Object = (s3Service, bucketName, key, sourceBucketName, sourceKey) => new Promise((resolve, reject) => s3Service.copyObject(
  { Bucket: bucketName, Key: key, CopySource: `/${sourceBucketName}/${sourceKey}` },
  (error, result) => {
    if (error) return reject(error)
    // __DEV__ && console.log('[copyS3Object]', result)
    const { CopyObjectResult: { ETag: copyObjectETag } } = result
    resolve({ copyObjectETag })
  }
))

export { connectAwsBucket }
