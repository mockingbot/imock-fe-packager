import nodeModulePath from 'path'
import { AWS, readFile } from 'source/__utils__'
import {
  getGitBranch,
  getGitCommitHash,
  doList,
  doUpload,
  doDownload,

  parseCLI,
  parseENV,
  parseJSON,
  processOptionMap,
  exitWithError
} from 'source/cli'

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

  if (PACKAGER_MODE === 'upload') {
    const CONTENT_PACKAGE_INFO = `${NAME_AWS_S3_BUCKET}\n${GIT_BRANCH}\n${GIT_COMMIT_HASH}\n${(new Date()).toISOString()}\n`
    const NAME_TAR_GZ_LATEST = `[${NAME_AWS_S3_BUCKET}][${GIT_BRANCH}]latest.tar.gz`
    const PATH_PACK = nodeModulePath.resolve(pathRelative, getOption('path-pack'))
    return doUpload(AWSInstance, { CONTENT_PACKAGE_INFO, NAME_TAR_GZ, NAME_TAR_GZ_LATEST, PATH_PACK })
  } else if (PACKAGER_MODE === 'download') {
    const PATH_UNPACK = nodeModulePath.resolve(pathRelative, getOption('path-unpack'))
    return doDownload(AWSInstance, { NAME_TAR_GZ, PATH_UNPACK })
  }
}

main().catch(exitWithError)
