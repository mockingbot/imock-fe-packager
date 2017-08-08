import nodeModulePath from 'path'
import { AWS, unlink, readFile, writeFile, formatSize, stringIndentLine } from 'source/__utils__'
import {
  getGitBranch,
  getGitCommitHash,
  doTarCompress,
  doTarExtract,

  parseCLI,
  parseENV,
  parseJSON,
  processOptionMap,
  exitWithError
} from 'source/cli'

const doList = async (AWSInstance) => {
  const contentList = await AWSInstance.downloadBufferList()
  contentList.forEach((v) => (v.LastModifiedDate = new Date(v.LastModified)))
  contentList.sort((a, b) => (b.LastModifiedDate - a.LastModifiedDate)) // bigger time first
  const listOutputString = contentList.map(({ Key, Size, LastModifiedDate, ETag }) => `${ETag} | ${LastModifiedDate.toISOString()} | ${Key} | ${formatSize(Size)}`).join('\n')
  console.log(`[List]\n${stringIndentLine(listOutputString, '  ')}`)
}

const doUpload = async (AWSInstance, { CONTENT_PACKAGE_INFO, NAME_TAR_GZ, NAME_TAR_GZ_LATEST, PATH_PACK }) => {
  await writeFile(nodeModulePath.join(PATH_PACK, 'PACKAGE_INFO'), CONTENT_PACKAGE_INFO)
  await doTarCompress(PATH_PACK, NAME_TAR_GZ)
  const buffer = readFile(NAME_TAR_GZ)
  console.log(`[Upload] packed from '${PATH_PACK}', size: ${formatSize(buffer.length)}`)
  await AWSInstance.uploadBufferToBucket(NAME_TAR_GZ, buffer)
  await AWSInstance.duplicateBufferInBucket(NAME_TAR_GZ_LATEST, NAME_TAR_GZ)
  await unlink(NAME_TAR_GZ)
  console.log(`[Upload] uploaded '${NAME_TAR_GZ}' and '${NAME_TAR_GZ_LATEST}'`)
}

const doDownload = async (AWSInstance, { NAME_TAR_GZ, NAME_TAR_GZ_LATEST, PATH_UNPACK }) => {
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

const main = async () => {
  let optionMap = parseCLI(process.argv)
  const getOption = (name) => optionMap[ name ] && optionMap[ name ].argumentList[ 0 ]

  const PATH_PACKAGER_CONFIG = getOption('config')
  let pathRelative
  if (!PATH_PACKAGER_CONFIG) {
    __DEV__ && console.log('all cli')
    pathRelative = process.cwd() // relative to the path cwd
  } else if (PATH_PACKAGER_CONFIG.toLowerCase() === 'env') {
    __DEV__ && console.log('merge env')
    optionMap = { ...parseENV(process.env), ...optionMap }
    pathRelative = process.cwd() // relative to the path cwd
  } else {
    __DEV__ && console.log('merge json', PATH_PACKAGER_CONFIG)
    optionMap = { ...parseJSON(JSON.parse(await readFile(PATH_PACKAGER_CONFIG, 'utf8'))), ...optionMap }
    pathRelative = nodeModulePath.dirname(PATH_PACKAGER_CONFIG) // relative to packager-config.json
  }

  __DEV__ && Object.keys(optionMap).forEach((name) => console.log(`[${name}] ${getOption(name)}`))
  optionMap = processOptionMap(optionMap)
  __DEV__ && console.log('processOptionMap PASS')

  const PACKAGER_MODE = getOption('mode')
  const NAME_AWS_S3_BUCKET = getOption('aws-s3-bucket')

  const AWSInstance = new AWS({
    accessKeyId: getOption('aws-access-key-id'),
    secretAccessKey: getOption('aws-secret-access-key'),
    region: getOption('aws-region')
  })
  await AWSInstance.selectS3Bucket(NAME_AWS_S3_BUCKET)

  if (PACKAGER_MODE === 'list') return doList(AWSInstance)

  const GIT_BRANCH = getOption('git-branch') || await getGitBranch()
  const GIT_COMMIT_HASH = getOption('git-commit-hash') || await getGitCommitHash()
  const NAME_TAR_GZ = `[${NAME_AWS_S3_BUCKET}][${GIT_BRANCH}]${GIT_COMMIT_HASH}.tar.gz`
  const NAME_TAR_GZ_LATEST = `[${NAME_AWS_S3_BUCKET}][${GIT_BRANCH}]latest.tar.gz`
  const CONTENT_PACKAGE_INFO = `${NAME_AWS_S3_BUCKET}\n${GIT_BRANCH}\n${GIT_COMMIT_HASH}\n${(new Date()).toISOString()}\n`

  if (PACKAGER_MODE === 'upload') {
    const PATH_PACK = nodeModulePath.resolve(pathRelative, getOption('path-pack'))
    return doUpload(AWSInstance, { CONTENT_PACKAGE_INFO, NAME_TAR_GZ, NAME_TAR_GZ_LATEST, PATH_PACK })
  } else if (PACKAGER_MODE === 'download') {
    const PATH_UNPACK = nodeModulePath.resolve(pathRelative, getOption('path-unpack'))
    return doDownload(AWSInstance, { NAME_TAR_GZ, NAME_TAR_GZ_LATEST, PATH_UNPACK })
  }
}

main().catch(exitWithError)
