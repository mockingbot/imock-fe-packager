import { AWS } from './AWS'
import { parseOption, exitWithError } from './option'
import { getGitBranch, getGitCommitHash, doList, doUpload, doDownload } from './cmd'

const main = async () => {
  const { optionMap, getSingleOption, getSingleOptionOptional } = await parseOption()
  try {
    const mode = getSingleOption(optionMap, 'mode')
    const nameAWSS3Bucket = getSingleOption(optionMap, 'aws-s3-bucket')

    const AWSInstance = new AWS({
      region: getSingleOption(optionMap, 'aws-region'),
      accessKeyId: getSingleOption(optionMap, 'aws-access-key-id'),
      secretAccessKey: getSingleOption(optionMap, 'aws-secret-access-key')
    })
    await AWSInstance.selectS3Bucket(nameAWSS3Bucket)

    if (mode === 'list') return doList(AWSInstance)

    const gitBranch = getSingleOptionOptional(optionMap, 'git-branch') || await getGitBranch()
    const gitCommitHash = getSingleOptionOptional(optionMap, 'git-commit-hash') || await getGitCommitHash()

    const nameFileTarGz = formatFilename(`[${nameAWSS3Bucket}][${gitBranch}]${gitCommitHash}.tar.gz`)
    if (mode === 'upload') {
      return doUpload(AWSInstance, {
        pathPack: getSingleOption(optionMap, 'path-pack'),
        nameFileTarGz,
        nameFileLatestTarGz: formatFilename(`[${nameAWSS3Bucket}][${gitBranch}]latest.tar.gz`),
        packageInfoString: [ nameAWSS3Bucket, gitBranch, gitCommitHash, (new Date()).toISOString() ].join('\n')
      })
    } else if (mode === 'download') {
      return doDownload(AWSInstance, {
        pathUnpack: getSingleOption(optionMap, 'path-unpack'),
        nameFileTarGz
      })
    }
  } catch (error) {
    console.warn(error)
    process.exit(2)
  }
}

const formatFilename = (filename = '') => filename.replace(/[/:;*%?]/g, '_')

main().catch(exitWithError)
