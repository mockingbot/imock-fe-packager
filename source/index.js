import { connectAwsBucket } from './bucketService/AWS'
import { connectTcBucket } from './bucketService/TC'
import { parseOption, formatUsage } from './option'
import { getGitBranch, getGitCommitHash, doList, doUpload, doDownload } from './cmd'

const main = async () => {
  const { getOptionOptional, getSingleOption, getSingleOptionOptional } = await parseOption()

  const mode = getSingleOption('mode')
  const isServiceAws = Boolean(getOptionOptional('service-aws'))
  const isServiceTc = Boolean(getOptionOptional('service-tc'))
  if (!isServiceAws && !isServiceTc) throw new Error('service not specified')

  try {
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

    if (mode === 'list') {
      await doList(bucketService)
      return
    }

    const gitBranch = getSingleOptionOptional('git-branch') || getGitBranch()
    const gitCommitHash = getSingleOptionOptional('git-commit-hash') || getGitCommitHash()

    const nameFileTarGz = formatFilename(`[${gitBranch}]${gitCommitHash}.tar.gz`)
    if (mode === 'upload') {
      await doUpload(bucketService, {
        pathPack: getSingleOption('path-pack'),
        nameFileTarGz,
        nameFileLatestTarGz: formatFilename(`[${gitBranch}]latest.tar.gz`),
        packageInfoString: [ bucket, gitBranch, gitCommitHash, (new Date()).toISOString() ].join('\n')
      })
    } else if (mode === 'download') {
      await doDownload(bucketService, {
        pathUnpack: getSingleOption('path-unpack'),
        nameFileTarGz
      })
    }
  } catch (error) {
    console.warn(error)
    process.exit(2)
  }
}

const formatFilename = (filename = '') => filename.replace(/[/:;*%?]/g, '_')

main().catch((error) => {
  console.warn(formatUsage(error.stack || error.message || error.toString()))
  process.exit(1)
})
