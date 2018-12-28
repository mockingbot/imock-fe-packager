import { connectAwsBucket, connectOssBucket, connectTcBucket } from 'bucket-sdk'
import { clock } from 'dr-js/module/common/time'
import { time as formatTime } from 'dr-js/module/common/format'

import { name as packageName, version as packageVersion } from '../package.json'
import { parseOption, formatUsage } from './option'
import { getGitBranch, getGitCommitHash } from './cmd/__utils__'
import { doList } from './cmd/list'
import { doUpload, doUploadFile } from './cmd/upload'
import { doDownload, doDownloadFile } from './cmd/download'
import { doDeleteOutdated, doDeleteFile } from './cmd/delete'
import { connectCustomBucket } from './customBucketService'

const formatFilename = (filename = '') => filename.replace(/[/:;*%?]/g, '_')

const runMode = async (mode, { tryGet, getFirst, tryGetFirst }, log) => {
  const isServiceAws = Boolean(tryGet('service-aws'))
  const isServiceOss = Boolean(tryGet('service-oss'))
  const isServiceTc = Boolean(tryGet('service-tc'))
  const isServiceCustom = Boolean(tryGet('service-custom'))
  if (!isServiceAws && !isServiceOss && !isServiceTc && !isServiceCustom) throw new Error('service not specified')

  const { region, bucket } = isServiceAws ? { region: getFirst('aws-region'), bucket: getFirst('aws-s3-bucket') }
    : isServiceOss ? { region: getFirst('oss-region'), bucket: getFirst('oss-bucket') }
      : isServiceTc ? { region: getFirst('tc-region'), bucket: getFirst('tc-bucket') }
        : isServiceCustom ? { region: 'CUSTOM', bucket: getFirst('custom-bucket') }
          : {}

  isServiceCustom
    ? log(`[Bucket] CUSTOM: ${bucket} (${getFirst('custom-file-upload-url')})`)
    : log(`[Bucket] ${isServiceAws ? 'AWS' : isServiceOss ? 'OSS' : 'TC'}: ${bucket} (${region})`)

  const bucketService = isServiceAws ? await connectAwsBucket({
    accessKeyId: getFirst('aws-access-key-id'),
    secretAccessKey: getFirst('aws-secret-access-key'),
    region,
    bucket
  }) : isServiceOss ? await connectOssBucket({
    accessKeyId: getFirst('oss-access-key-id'),
    accessKeySecret: getFirst('oss-access-key-secret'),
    region,
    bucket
  }) : isServiceTc ? await connectTcBucket({
    appId: getFirst('tc-app-id'),
    secretId: getFirst('tc-secret-id'),
    secretKey: getFirst('tc-secret-key'),
    region,
    bucket
  }) : isServiceCustom ? await connectCustomBucket({
    fileAuth: getFirst('custom-auth-file'),
    urlPathAction: getFirst('custom-path-action-url'),
    urlFileUpload: getFirst('custom-file-upload-url'),
    urlFileDownload: getFirst('custom-file-download-url'),
    timeout: tryGetFirst('custom-fetch-timeout') || 30 * 1000,
    bucket
  }) : null

  if (mode === 'list') return doList(bucketService, { listKeyPrefix: tryGetFirst('list-key-prefix') }, log)
  if (mode === 'delete-outdated') return doDeleteOutdated(bucketService, { outdatedTime: tryGetFirst('delete-outdated-time') }, log)

  const uploadPublicReadAccess = Boolean(tryGet('upload-public-read-access'))

  if (mode === 'upload-file') return doUploadFile(bucketService, { pathFile: getFirst('path-file'), keyFile: getFirst('key-file'), uploadPublicReadAccess }, log)
  if (mode === 'download-file') return doDownloadFile(bucketService, { pathFile: getFirst('path-file'), keyFile: getFirst('key-file') }, log)
  if (mode === 'delete-file') return doDeleteFile(bucketService, { keyFile: getFirst('key-file') }, log)

  const gitBranch = tryGetFirst('git-branch') || getGitBranch()
  const gitCommitHash = tryGetFirst('git-commit-hash') || getGitCommitHash()
  const nameFileTarGz = formatFilename(`[${gitBranch}]${gitCommitHash}.tar.gz`)

  if (mode === 'download') return doDownload(bucketService, { pathUnpack: getFirst('path-unpack'), nameFileTarGz }, log)
  if (mode === 'upload') {
    await doUpload(bucketService, {
      pathPack: getFirst('path-pack'),
      nameFileTarGz,
      nameFileLatestTarGz: formatFilename(`[${gitBranch}]latest.tar.gz`),
      packageInfoString: [ region, bucket, gitBranch, gitCommitHash, (new Date()).toISOString() ].join('\n'),
      uploadPublicReadAccess
    }, log)
  }
}

const main = async () => {
  const optionData = await parseOption()
  const mode = optionData.tryGetFirst('mode')
  const log = optionData.tryGet('quiet') ? () => {} : console.log

  if (!mode) {
    return optionData.tryGet('version')
      ? console.log(JSON.stringify({ packageName, packageVersion }, null, '  '))
      : console.log(formatUsage(null, optionData.tryGet('help') ? null : 'simple'))
  }

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
}

main().catch((error) => {
  console.warn(formatUsage(error.stack || error, 'simple'))
  process.exit(1)
})
