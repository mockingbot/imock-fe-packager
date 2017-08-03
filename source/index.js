import nodeModulePath from 'path'
import { AWS } from './AWS'
import { runCommand } from './runCommand'
import { unlink, readFile, writeFile, isFileExist, formatSize } from './file'

const getAWSInstance = async ({ NAME_AWS_S3_BUCKET }, PATH_PACKAGER_CONFIG) => {
  if (!isFileExist(PATH_PACKAGER_CONFIG)) throw new Error(`[Error] can't open config at: ${PATH_PACKAGER_CONFIG}`)
  const AWSInstance = new AWS(PATH_PACKAGER_CONFIG)
  await AWSInstance.selectS3Bucket(NAME_AWS_S3_BUCKET)
  return AWSInstance
}

const getGitInfo = async (config, { PACKAGER_GIT_BRANCH = '', PACKAGER_GIT_COMMIT_HASH = '' }) => {
  if (PACKAGER_GIT_BRANCH) config.GIT_BRANCH = PACKAGER_GIT_BRANCH
  if (PACKAGER_GIT_COMMIT_HASH) config.GIT_COMMIT_HASH = PACKAGER_GIT_COMMIT_HASH

  if (!config.GIT_BRANCH) config.GIT_BRANCH = (await runCommand('git symbolic-ref --short HEAD')).stdoutString.replace('\n', '')
  if (!config.GIT_COMMIT_HASH) config.GIT_COMMIT_HASH = (await runCommand('git log -1 --format="%H"')).stdoutString.replace('\n', '')

  config.CONTENT_PACKAGE_INFO = `${config.NAME_AWS_S3_BUCKET}\n${config.GIT_BRANCH}\n${config.GIT_COMMIT_HASH}`
  config.NAME_TAR_GZ = `[${config.NAME_AWS_S3_BUCKET}][${config.GIT_BRANCH}]${config.GIT_COMMIT_HASH}.tar.gz`
  config.NAME_TAR_GZ_LATEST = `[${config.NAME_AWS_S3_BUCKET}][${config.GIT_BRANCH}]latest.tar.gz`
}

const doList = async (config, AWSInstance) => {
  const contentList = await AWSInstance.downloadBufferList()
  contentList.forEach((v) => (v.LastModifiedDate = new Date(v.LastModified)))
  contentList.sort((a, b) => (b.LastModifiedDate - a.LastModifiedDate)) // bigger time first
  console.log(`[List]\n  ${contentList.map(({ Key, Size, LastModifiedDate, ETag }) => `${ETag} | ${LastModifiedDate.toISOString()} | ${Key} | ${formatSize(Size)}`).join('\n  ')}`)
}

const doUpload = async ({ CONTENT_PACKAGE_INFO, NAME_TAR_GZ, NAME_TAR_GZ_LATEST, PATH_PACK }, AWSInstance) => {
  PATH_PACK = nodeModulePath.resolve(nodeModulePath.dirname(FILE_SCRIPT), PATH_PACK) // relative to the path of this script
  await writeFile(nodeModulePath.join(PATH_PACK, 'PACKAGE_INFO'), CONTENT_PACKAGE_INFO)
  const buffer = await packBuffer(PATH_PACK, NAME_TAR_GZ)
  console.log(`[Upload] packed from '${PATH_PACK}', size: ${formatSize(buffer.length)}`)
  await AWSInstance.uploadBufferToBucket(NAME_TAR_GZ, buffer)
  await AWSInstance.duplicateBufferInBucket(NAME_TAR_GZ_LATEST, NAME_TAR_GZ)
  await unlink(NAME_TAR_GZ)
  console.log(`[Upload] uploaded '${NAME_TAR_GZ}' and '${NAME_TAR_GZ_LATEST}'`)
}

const doDownload = async ({ NAME_TAR_GZ, NAME_TAR_GZ_LATEST, PATH_UNPACK }, AWSInstance) => {
  PATH_UNPACK = nodeModulePath.resolve(nodeModulePath.dirname(FILE_SCRIPT), PATH_UNPACK) // relative to the path of this script
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
  await unpackBuffer(buffer, NAME_TAR_GZ, PATH_UNPACK)
  await unlink(NAME_TAR_GZ)
  console.log(`[Download] unpacked to '${PATH_UNPACK}'`)
}

const packBuffer = async (sourcePath = './', outputFileName = 'pack.tar.gz') => {
  await runCommand(`tar -czf "${outputFileName}" -C ${sourcePath} .`)
  return readFile(outputFileName)
}

const unpackBuffer = async (buffer, sourceFileName = 'pack.tar.gz', outputPath = './') => {
  await writeFile(sourceFileName, buffer)
  await runCommand(`tar --strip-components 1 -xzf "${sourceFileName}" -C ${outputPath}`)
}

const [ FILE_NODE, FILE_SCRIPT, PATH_PACKAGER_CONFIG = '', PACKAGER_MODE = '', PACKAGER_GIT_BRANCH = '', PACKAGER_GIT_COMMIT_HASH = '' ] = process.argv

// __DEV__ && console.log(process.cwd(), process.argv)

const getUsage = (message) => `[imock-fe-packager]
${message ? `\n  ${message.split('\\n').join('\\n    ')}\n` : ''}
Usage: 
  [node]${FILE_NODE} +
  [script.js]${FILE_SCRIPT} +
  [config.json]${PATH_PACKAGER_CONFIG} +
  [mode]${PACKAGER_MODE} +
  [git-branch] +
  [git-commit-hash]

Argument:
  - [config.json]: 
      config file with AWS access info, and packager operate path
  - [mode]: 
      should be 'upload', 'download', or 'list'
      'list' do not need [git-branch] or [git-commit-hash]
  - [git-branch]: 
      optional, git branch name like 'master'
      will get from [config.json] or 'git symbolic-ref --short HEAD'
  - [git-commit-hash]: 
      optional, git commit hash like 'a1b2c3d4e5f6', or 'latest' for 'download'
      will get from [config.json] or 'git log -1 --format="%H"'

Example:
  [node] [script.js] [config.json] list
  [node] [script.js] [config.json] upload
  [node] [script.js] [config.json] upload [git-branch]
  [node] [script.js] [config.json] upload [git-branch] [git-commit-hash]
  [node] [script.js] [config.json] download
  [node] [script.js] [config.json] download [git-branch]
  [node] [script.js] [config.json] download [git-branch] [git-commit-hash]
  [node] [script.js] [config.json] download [git-branch] latest
`

const onError = (error) => {
  __DEV__ && console.warn(error)
  console.warn(getUsage(error.message || error.toString()))
  process.exit(1)
}

const main = async () => {
  if (!PATH_PACKAGER_CONFIG) throw new Error(`[config.json] config file path expected, got '${PATH_PACKAGER_CONFIG}'`)
  const { IMOCK_FE_PACKAGER: config } = JSON.parse(await readFile(PATH_PACKAGER_CONFIG, 'utf8'))
  const AWSInstance = await getAWSInstance(config, PATH_PACKAGER_CONFIG)
  console.log(`[imock-fe-packager] mode: '${PACKAGER_MODE}'`)

  if (PACKAGER_MODE.toLowerCase() === 'list') return doList(config, AWSInstance)

  await getGitInfo(config, { PACKAGER_GIT_BRANCH, PACKAGER_GIT_COMMIT_HASH })
  console.log(`[imock-fe-packager] git branch: '${config.GIT_BRANCH}' git commit hash: '${config.GIT_COMMIT_HASH}'`)

  if (PACKAGER_MODE.toLowerCase() === 'upload') return doUpload(config, AWSInstance)
  if (PACKAGER_MODE.toLowerCase() === 'download') return doDownload(config, AWSInstance)

  throw new Error(`[mode] 'upload', 'download', or 'list' expected, got '${PACKAGER_MODE}'`)
}

main().catch(onError)
