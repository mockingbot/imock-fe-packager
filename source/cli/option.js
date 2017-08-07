import { createOptionParser, OPTION_CONFIG_PRESET } from 'source/__utils__/optionParser'

const OPTION_CONFIG = {
  prefixENV: 'packager',
  formatList: [
    {
      name: 'config',
      shortName: 'c',
      optional: true,
      description: [
        `# JSON`,
        `  config file path with AWS access info, and packager operate path`,
        `# ENV`,
        `  set to 'env' to collect from process.env, required keys:`,
        `    aws: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET`,
        `    packager: PACKAGER_PATH_PACK, PACKAGER_PATH_UNPACK`,
        `  optional keys:`,
        `    packager: PACKAGER_GIT_BRANCH, PACKAGER_GIT_COMMIT_HASH`
      ].join('\n'),
      ...OPTION_CONFIG_PRESET.SingleString
    },
    {
      name: 'mode',
      shortName: 'm',
      description: `should be 'upload', 'download', or 'list'\n'list' do not need [git-branch] or [git-commit-hash]`,
      ...OPTION_CONFIG_PRESET.OneOfString([ 'list', 'upload', 'download' ])
    },
    { name: 'path-pack', shortName: 'p', description: '/absolute/path/ or ./path/relative/to/packager-config.json/', ...OPTION_CONFIG_PRESET.SingleString },
    { name: 'path-unpack', shortName: 'u', description: '/absolute/path/ or ./path/relative/to/packager-config.json/', ...OPTION_CONFIG_PRESET.SingleString },
    { name: 'aws-access-key-id', ...OPTION_CONFIG_PRESET.SingleString },
    { name: 'aws-secret-access-key', ...OPTION_CONFIG_PRESET.SingleString },
    { name: 'aws-region', description: `should be 'cn-north-1'`, ...OPTION_CONFIG_PRESET.SingleString },
    { name: 'aws-s3-bucket', description: `should be 'imock-fe'`, ...OPTION_CONFIG_PRESET.SingleString },
    { name: 'git-branch', shortName: 'b', optional: true, description: `git branch name like 'master'\nwill get from [config] or 'git symbolic-ref --short HEAD'`, ...OPTION_CONFIG_PRESET.SingleString },
    { name: 'git-commit-hash', shortName: 'h', optional: true, description: `git commit hash like 'a1b2c3d4e5f6', or 'latest' for 'download'\nwill get from [config] or 'git log -1 --format="%H"'`, ...OPTION_CONFIG_PRESET.SingleString }
  ]
}

const {
  parseCLI,
  parseENV,
  parseJSON,
  processOptionMap,
  formatUsage
} = createOptionParser(OPTION_CONFIG)

const exitWithError = (error) => {
  __DEV__ && console.warn(error)
  console.warn(formatUsage(error.message || error.toString()))
  process.exit(1)
}

export {
  parseCLI,
  parseENV,
  parseJSON,
  processOptionMap,
  exitWithError
}
