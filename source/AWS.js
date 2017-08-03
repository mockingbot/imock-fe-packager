import nodeModuleFs from 'fs'
import AWS_SDK from 'aws-sdk/global'
import AWS_SDK_S3 from 'aws-sdk/clients/s3'

class AWS {
  constructor (configJSONPath) {
    if (!nodeModuleFs.existsSync(configJSONPath)) throw new Error(`[AWS] can't open config at: ${configJSONPath}`)

    try {
      AWS_SDK.config.loadFromPath(configJSONPath)
    } catch (error) {
      console.warn(error)
      throw new Error(`[Error] failed to load config at: ${configJSONPath}`)
    }

    this.s3ServiceObject = new AWS_SDK_S3()
    this.s3BucketName = ''
  }

  async selectS3Bucket (BUCKET_NAME) {
    const { Buckets } = await listBuckets(this.s3ServiceObject)
    if (Buckets.find(({ Name }) => Name === BUCKET_NAME)) this.s3BucketName = BUCKET_NAME
    else throw new Error(`[selectS3Bucket] bucket not found with name: ${BUCKET_NAME}`)
    __DEV__ && console.log(`[selectS3Bucket] selected bucket: ${this.s3BucketName}`)
  }

  async downloadBufferList () {
    if (!this.s3BucketName) throw new Error('[downloadBufferList] should select bucket with selectS3Bucket()')
    const { Contents } = await listObjects(this.s3ServiceObject, this.s3BucketName)
    __DEV__ && console.log(`[downloadBufferList] downloaded buffer list. length: ${Contents.length}`)
    return Contents // [ { Key, Size, LastModified, ETag } ]
  }

  async uploadBufferToBucket (key, buffer) {
    if (!this.s3BucketName) throw new Error('[uploadBufferToBucket] should select bucket with selectS3Bucket()')
    const { ETag } = await putObject(this.s3ServiceObject, this.s3BucketName, key, buffer)
    __DEV__ && console.log(`[uploadBufferToBucket] uploaded buffer. ETag: ${ETag}`)
  }

  async duplicateBufferInBucket (key, sourceKey) {
    if (!this.s3BucketName) throw new Error('[duplicateBufferInBucket] should select bucket with selectS3Bucket()')
    const { CopyObjectResult: { ETag } } = await copyObject(this.s3ServiceObject, this.s3BucketName, key, this.s3BucketName, sourceKey)
    __DEV__ && console.log(`[duplicateBufferInBucket] updated latest. ETag: ${ETag}`)
  }

  async downloadBufferFromBucket (key) {
    if (!this.s3BucketName) throw new Error('[downloadBufferFromBucket] should select bucket with selectS3Bucket()')
    const { Body, ETag } = await getObject(this.s3ServiceObject, this.s3BucketName, key)
    __DEV__ && console.log(`[downloadBufferFromBucket] downloaded buffer. ETag: ${ETag}`)
    return Buffer.from(Body) // should be Buffer, but according to Doc: (Buffer, Typed Array, Blob, String, ReadableStream) Object data
  }
}

// check: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html

const listBuckets = (s3ServiceObject) => new Promise((resolve, reject) => s3ServiceObject.listBuckets(
  (error, data) => error ? reject(error) : resolve(data)
))

const listObjects = (s3ServiceObject, bucketName) => new Promise((resolve, reject) => s3ServiceObject.listObjects(
  { Bucket: bucketName, MaxKeys: 512 },
  (error, data) => error ? reject(error) : resolve(data)
))

const getObject = (s3ServiceObject, bucketName, key) => new Promise((resolve, reject) => s3ServiceObject.getObject(
  { Bucket: bucketName, Key: key },
  (error, data) => error ? reject(error) : resolve(data)
))

const putObject = (s3ServiceObject, bucketName, key, buffer) => new Promise((resolve, reject) => s3ServiceObject.putObject(
  { Bucket: bucketName, Key: key, Body: buffer },
  (error, data) => error ? reject(error) : resolve(data)
))

const copyObject = (s3ServiceObject, bucketName, key, sourceBucketName, sourceKey) => new Promise((resolve, reject) => s3ServiceObject.copyObject(
  { Bucket: bucketName, Key: key, CopySource: `/${sourceBucketName}/${sourceKey}` },
  (error, data) => error ? reject(error) : resolve(data)
))

export {
  AWS
}
