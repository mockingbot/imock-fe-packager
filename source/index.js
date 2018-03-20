import { connectAwsBucket, connectTcBucket } from 'bucket-sdk'
import { parseOption, formatUsage } from './option'
import { getGitBranch, getGitCommitHash } from './cmd/__utils__'
import { doList } from './cmd/list'
import { doUpload, doUploadFile } from './cmd/upload'
import { doDownload, doDownloadFile } from './cmd/download'
import { doDeleteOutdated, doDeleteFile } from './cmd/delete'
import { name as packageName, version as packageVersion } from '../package.json'

const formatFilename = (filename = '') => filename.replace(/[/:;*%?]/g, '_')

const runMode = async (mode, { getOptionOptional, getSingleOption, getSingleOptionOptional }) => {
  const isServiceAws = Boolean(getOptionOptional('service-aws'))
  const isServiceTc = Boolean(getOptionOptional('service-tc'))
  if (!isServiceAws && !isServiceTc) throw new Error('service not specified')

  const { region, bucket } = isServiceAws ? {
    region: getSingleOption('aws-region'),
    bucket: getSingleOption('aws-s3-bucket')
  } : isServiceTc ? {
    region: getSingleOption('tc-region'),
    bucket: getSingleOption('tc-bucket')
  } : {}

  const bucketService = isServiceAws ? await connectAwsBucket({
    accessKeyId: getSingleOption('aws-access-key-id'),
    secretAccessKey: getSingleOption('aws-secret-access-key'),
    region,
    bucket
  }) : isServiceTc ? await connectTcBucket({
    appId: getSingleOption('tc-app-id'),
    secretId: getSingleOption('tc-secret-id'),
    secretKey: getSingleOption('tc-secret-key'),
    region,
    bucket
  }) : null

  if (mode === 'list') return doList(bucketService, { listKeyPrefix: getSingleOptionOptional('list-key-prefix') })
  if (mode === 'delete-outdated') return doDeleteOutdated(bucketService, { outdatedTime: getSingleOptionOptional('delete-outdated-time') })

  const uploadPublicReadAccess = Boolean(getOptionOptional('upload-public-read-access'))

  if (mode === 'upload-file') return doUploadFile(bucketService, { pathFile: getSingleOption('path-file'), keyFile: getSingleOption('key-file'), uploadPublicReadAccess })
  if (mode === 'download-file') return doDownloadFile(bucketService, { pathFile: getSingleOption('path-file'), keyFile: getSingleOption('key-file') })
  if (mode === 'delete-file') return doDeleteFile(bucketService, { keyFile: getSingleOption('key-file') })

  const gitBranch = getSingleOptionOptional('git-branch') || getGitBranch()
  const gitCommitHash = getSingleOptionOptional('git-commit-hash') || getGitCommitHash()
  const nameFileTarGz = formatFilename(`[${gitBranch}]${gitCommitHash}.tar.gz`)

  if (mode === 'download') return doDownload(bucketService, { pathUnpack: getSingleOption('path-unpack'), nameFileTarGz })
  if (mode === 'upload') {
    await doUpload(bucketService, {
      pathPack: getSingleOption('path-pack'),
      nameFileTarGz,
      nameFileLatestTarGz: formatFilename(`[${gitBranch}]latest.tar.gz`),
      packageInfoString: [ region, bucket, gitBranch, gitCommitHash, (new Date()).toISOString() ].join('\n'),
      uploadPublicReadAccess
    })
  }
}

const main = async () => {
  const optionData = await parseOption()
  const mode = optionData.getSingleOptionOptional('mode')

  if (mode) {
    await runMode(mode, optionData).catch((error) => {
      console.warn(`[Error] in mode: ${mode}:`, error.stack || error)
      process.exit(2)
    })
  } else optionData.getOptionOptional('version') ? console.log(JSON.stringify({ packageName, packageVersion }, null, '  ')) : console.log(formatUsage())
}

main().catch((error) => {
  console.warn(formatUsage(error.stack || error, 'simple'))
  process.exit(1)
})
