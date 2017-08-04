const logUsage = (message) => `[imock-fe-packager]
${message ? `\n  ${message.split('\\n').join('\\n    ')}\n` : ''}
Usage: 
  [node]${process.argv[ 0 ] || ''} +
  [script]${process.argv[ 1 ] || ''} +
  [config]${process.argv[ 2 ] || ''} +
  [mode]${process.argv[ 3 ] || ''} +
  [git-branch] +
  [git-commit-hash]

Argument:
  - [config]: 
      # JSON
        config file with AWS access info, and packager operate path
      # ENV
        set to 'env' to collect from process.env, required keys:
          aws: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET
          packager: PACKAGER_PATH_PACK, PACKAGER_PATH_UNPACK
        optional keys:
          packager: PACKAGER_GIT_BRANCH, PACKAGER_GIT_COMMIT_HASH
  - [mode]: 
      should be 'upload', 'download', or 'list'
      'list' do not need [git-branch] or [git-commit-hash]
  - [git-branch]: 
      optional, git branch name like 'master'
      will get from [config] or 'git symbolic-ref --short HEAD'
  - [git-commit-hash]: 
      optional, git commit hash like 'a1b2c3d4e5f6', or 'latest' for 'download'
      will get from [config] or 'git log -1 --format="%H"'

Example:
  [node] [script] [config] list
  [node] [script] env list
  [node] [script] [config] upload
  [node] [script] [config] upload [git-branch]
  [node] [script] [config] upload [git-branch] [git-commit-hash]
  [node] [script] [config] download
  [node] [script] [config] download [git-branch]
  [node] [script] [config] download [git-branch] [git-commit-hash]
  [node] [script] [config] download [git-branch] latest
`

const logErrorAndExit = (error) => {
  __DEV__ && console.warn(error)
  console.warn(logUsage(error.message || error.toString()))
  process.exit(1)
}

export {
  logUsage,
  logErrorAndExit
}
