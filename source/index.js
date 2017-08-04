import nodeModulePath from 'path'
import { AWS, unlink, readFile, writeFile, formatSize } from 'source/__utils__'
import { getGitBranch, getGitCommitHash, doTarCompress, doTarExtract, logErrorAndExit } from 'source/cli'

const doList = async (config, AWSInstance) => {
  const contentList = await AWSInstance.downloadBufferList()
  contentList.forEach((v) => (v.LastModifiedDate = new Date(v.LastModified)))
  contentList.sort((a, b) => (b.LastModifiedDate - a.LastModifiedDate)) // bigger time first
  console.log(`[List]\n  ${contentList.map(({ Key, Size, LastModifiedDate, ETag }) => `${ETag} | ${LastModifiedDate.toISOString()} | ${Key} | ${formatSize(Size)}`).join('\n  ')}`)
}

const doUpload = async ({ CONTENT_PACKAGE_INFO, NAME_TAR_GZ, NAME_TAR_GZ_LATEST, PATH_PACK }, AWSInstance) => {
  await writeFile(nodeModulePath.join(PATH_PACK, 'PACKAGE_INFO'), CONTENT_PACKAGE_INFO)
  await doTarCompress(PATH_PACK, NAME_TAR_GZ)
  const buffer = readFile(NAME_TAR_GZ)
  console.log(`[Upload] packed from '${PATH_PACK}', size: ${formatSize(buffer.length)}`)
  await AWSInstance.uploadBufferToBucket(NAME_TAR_GZ, buffer)
  await AWSInstance.duplicateBufferInBucket(NAME_TAR_GZ_LATEST, NAME_TAR_GZ)
  await unlink(NAME_TAR_GZ)
  console.log(`[Upload] uploaded '${NAME_TAR_GZ}' and '${NAME_TAR_GZ_LATEST}'`)
}

const doDownload = async ({ NAME_TAR_GZ, NAME_TAR_GZ_LATEST, PATH_UNPACK }, AWSInstance) => {
  let buffer = null
  try {
    buffer = await AWSInstance.downloadBufferFromBucket(NAME_TAR_GZ)
    console.log(`[Download] downloaded '${NAME_TAR_GZ}', size: ${formatSize(buffer.length)}`)
  } catch (error) {
    console.log(`[Download] failed to get file: '${NAME_TAR_GZ}', error: ${error.message}`)
    console.log(`[Download] try latest file: '${NAME_TAR_GZ_LATEST}'`)
    buffer = await AWSInstance.downloadBufferFromBucket(NAME_TAR_GZ_LATEST)
    console.log(`[Download] downloaded '${NAME_TAR_GZ_LATEST}', size: ${formatSize(buffer.length)}`)
  }
  await writeFile(NAME_TAR_GZ, buffer)
  await doTarExtract(NAME_TAR_GZ, PATH_UNPACK)
  await unlink(NAME_TAR_GZ)
  console.log(`[Download] unpacked to '${PATH_UNPACK}'`)
}

const applyENVConfig = (config) => {
  const {
    AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET,
    PACKAGER_PATH_PACK, PACKAGER_PATH_UNPACK,
    PACKAGER_GIT_BRANCH, PACKAGER_GIT_COMMIT_HASH
  } = process.env

  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_REGION) throw new Error(`[applyENVConfig] env expected: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION`)
  config.AWS_CONFIG = { accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY, region: AWS_REGION }

  if (!AWS_S3_BUCKET) throw new Error(`[applyENVConfig] env expected: AWS_S3_BUCKET`)
  config.NAME_AWS_S3_BUCKET = AWS_S3_BUCKET

  if (!PACKAGER_PATH_PACK || !PACKAGER_PATH_UNPACK) throw new Error(`[applyENVConfig] env expected: PACKAGER_PATH_PACK, PACKAGER_PATH_UNPACK`)
  config.PATH_PACK = PACKAGER_PATH_PACK
  config.PATH_UNPACK = PACKAGER_PATH_UNPACK

  if (PACKAGER_GIT_BRANCH) config.GIT_BRANCH = PACKAGER_GIT_BRANCH
  if (PACKAGER_GIT_COMMIT_HASH) config.GIT_COMMIT_HASH = PACKAGER_GIT_COMMIT_HASH
}

const applyJSONConfig = async (config, PATH_PACKAGER_CONFIG) => {
  const { accessKeyId, secretAccessKey, region, IMOCK_FE_PACKAGER } = JSON.parse(await readFile(PATH_PACKAGER_CONFIG, 'utf8'))
  Object.assign(config, {
    ...IMOCK_FE_PACKAGER, // { NAME_AWS_S3_BUCKET, PATH_PACK, PATH_UNPACK, GIT_BRANCH, GIT_COMMIT_HASH }
    AWS_CONFIG: { accessKeyId, secretAccessKey, region }
  })
}

const applyGitConfig = async (config) => {
  const [ , , , , PACKAGER_GIT_BRANCH, PACKAGER_GIT_COMMIT_HASH ] = process.argv
  config.GIT_BRANCH = PACKAGER_GIT_BRANCH || config.GIT_BRANCH || await getGitBranch()
  config.GIT_COMMIT_HASH = PACKAGER_GIT_COMMIT_HASH || config.GIT_COMMIT_HASH || await getGitCommitHash()
  console.log(`[imock-fe-packager] git branch: '${config.GIT_BRANCH}' git commit hash: '${config.GIT_COMMIT_HASH}'`)
}

const main = async (config = {}) => {
  const [ , FILE_SCRIPT, PATH_PACKAGER_CONFIG, PACKAGER_MODE = '' ] = process.argv

  // __DEV__ && console.log(process.cwd(), process.argv)

  if (!PATH_PACKAGER_CONFIG) throw new Error(`[config] json file path or 'env' expected, got '${PATH_PACKAGER_CONFIG}'`)
  if (PATH_PACKAGER_CONFIG.toLowerCase() === 'env') applyENVConfig(config)
  else await applyJSONConfig(config, PATH_PACKAGER_CONFIG)

  __DEV__ && console.log(config)

  const AWSInstance = new AWS(config.AWS_CONFIG)
  await AWSInstance.selectS3Bucket(config.NAME_AWS_S3_BUCKET)

  console.log(`[imock-fe-packager] mode: '${PACKAGER_MODE}'`)

  if (PACKAGER_MODE.toLowerCase() === 'list') return doList(config, AWSInstance)

  config.PATH_PACK = nodeModulePath.resolve(nodeModulePath.dirname(FILE_SCRIPT), config.PATH_PACK) // relative to the path of this script
  config.PATH_UNPACK = nodeModulePath.resolve(nodeModulePath.dirname(FILE_SCRIPT), config.PATH_UNPACK) // relative to the path of this script

  await applyGitConfig(config)

  config.CONTENT_PACKAGE_INFO = `${config.NAME_AWS_S3_BUCKET}\n${config.GIT_BRANCH}\n${config.GIT_COMMIT_HASH}`
  config.NAME_TAR_GZ = `[${config.NAME_AWS_S3_BUCKET}][${config.GIT_BRANCH}]${config.GIT_COMMIT_HASH}.tar.gz`
  config.NAME_TAR_GZ_LATEST = `[${config.NAME_AWS_S3_BUCKET}][${config.GIT_BRANCH}]latest.tar.gz`

  if (PACKAGER_MODE.toLowerCase() === 'upload') return doUpload(config, AWSInstance)
  if (PACKAGER_MODE.toLowerCase() === 'download') return doDownload(config, AWSInstance)

  throw new Error(`[mode] 'upload', 'download', or 'list' expected, got '${PACKAGER_MODE}'`)
}

main().catch(logErrorAndExit)
