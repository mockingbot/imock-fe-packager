import { connectAwsBucket, connectOssBucket, connectTcBucket } from 'bucket-sdk'
import { clock } from 'dr-js/module/common/time'
import { time as formatTime } from 'dr-js/module/common/format'
import { parseOption, formatUsage } from './option'
import { getGitBranch, getGitCommitHash } from './cmd/__utils__'
import { doList } from './cmd/list'
import { doUpload, doUploadFile } from './cmd/upload'
import { doDownload, doDownloadFile } from './cmd/download'
import { doDeleteOutdated, doDeleteFile } from './cmd/delete'
import { name as packageName, version as packageVersion } from '../package.json'

const formatFilename = (filename = '') => filename.replace(/[/:;*%?]/g, '_')

const runMode = async (mode, { getOptionOptional, getSingleOption, getSingleOptionOptional }, log) => {
  const isServiceAws = Boolean(getOptionOptional('service-aws'))
  const isServiceOss = Boolean(getOptionOptional('service-oss'))
  const isServiceTc = Boolean(getOptionOptional('service-tc'))
  if (!isServiceAws && !isServiceOss && !isServiceTc) throw new Error('service not specified')

  const { region, bucket } = isServiceAws ? { region: getSingleOption('aws-region'), bucket: getSingleOption('aws-s3-bucket') }
    : isServiceOss ? { region: getSingleOption('oss-region'), bucket: getSingleOption('oss-bucket') }
      : isServiceTc ? { region: getSingleOption('tc-region'), bucket: getSingleOption('tc-bucket') }
        : {}

  log(`[Bucket] ${isServiceAws ? 'AWS' : isServiceOss ? 'OSS' : 'TC'}: ${bucket} (${region})`)

  const bucketService = isServiceAws ? await connectAwsBucket({
    accessKeyId: getSingleOption('aws-access-key-id'),
    secretAccessKey: getSingleOption('aws-secret-access-key'),
    region,
    bucket
  }) : isServiceOss ? await connectOssBucket({
    accessKeyId: getSingleOption('oss-access-key-id'),
    accessKeySecret: getSingleOption('oss-access-key-secret'),
    region,
    bucket
  }) : isServiceTc ? await connectTcBucket({
    appId: getSingleOption('tc-app-id'),
    secretId: getSingleOption('tc-secret-id'),
    secretKey: getSingleOption('tc-secret-key'),
    region,
    bucket
  }) : null

  if (mode === 'list') return doList(bucketService, { listKeyPrefix: getSingleOptionOptional('list-key-prefix') }, log)
  if (mode === 'delete-outdated') return doDeleteOutdated(bucketService, { outdatedTime: getSingleOptionOptional('delete-outdated-time') }, log)

  const uploadPublicReadAccess = Boolean(getOptionOptional('upload-public-read-access'))

  if (mode === 'upload-file') return doUploadFile(bucketService, { pathFile: getSingleOption('path-file'), keyFile: getSingleOption('key-file'), uploadPublicReadAccess }, log)
  if (mode === 'download-file') return doDownloadFile(bucketService, { pathFile: getSingleOption('path-file'), keyFile: getSingleOption('key-file') }, log)
  if (mode === 'delete-file') return doDeleteFile(bucketService, { keyFile: getSingleOption('key-file') }, log)

  const gitBranch = getSingleOptionOptional('git-branch') || getGitBranch()
  const gitCommitHash = getSingleOptionOptional('git-commit-hash') || getGitCommitHash()
  const nameFileTarGz = formatFilename(`[${gitBranch}]${gitCommitHash}.tar.gz`)

  if (mode === 'download') return doDownload(bucketService, { pathUnpack: getSingleOption('path-unpack'), nameFileTarGz }, log)
  if (mode === 'upload') {
    await doUpload(bucketService, {
      pathPack: getSingleOption('path-pack'),
      nameFileTarGz,
      nameFileLatestTarGz: formatFilename(`[${gitBranch}]latest.tar.gz`),
      packageInfoString: [ region, bucket, gitBranch, gitCommitHash, (new Date()).toISOString() ].join('\n'),
      uploadPublicReadAccess
    }, log)
  }
}

const main = async () => {
  const optionData = await parseOption()
  const mode = optionData.getSingleOptionOptional('mode')
  const log = optionData.getOptionOptional('quiet') ? () => {} : console.log

  if (mode) {
    let prevTime = clock()
    const logWithTime = (...args) => {
      const deltaTime = clock() - prevTime
      prevTime += deltaTime
      log(...args, `(+${formatTime(deltaTime)})`)
    }
    await runMode(mode, optionData, logWithTime).catch((error) => {
      console.warn(`[Error] in mode: ${mode}:`, error.stack || error)
      process.exit(2)
    })
  } else optionData.getOptionOptional('version') ? console.log(JSON.stringify({ packageName, packageVersion }, null, '  ')) : console.log(formatUsage())
}

main().catch((error) => {
  console.warn(formatUsage(error.stack || error, 'simple'))
  process.exit(1)
})
