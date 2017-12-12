import { createOptionParser, OPTION_CONFIG_PRESET } from 'dr-js/module/common/module/OptionParser'
import { parseOptionMap, getOptionOptional, getSingleOptionOptional, getOption, getSingleOption } from 'dr-js/module/node/module/ParseOption'

const SingleStringPathFormat = { ...OPTION_CONFIG_PRESET.SingleString, isPath: true }
const checkOptional = (name, value) => (optionMap) => optionMap[ name ].argumentList[ 0 ] !== value

const OPTION_CONFIG = {
  prefixENV: 'packager',
  formatList: [
    {
      ...OPTION_CONFIG_PRESET.SingleString,
      name: 'config',
      shortName: 'c',
      optional: true,
      description: `# from JSON: set to 'path/to/config.json'\n# from ENV: set to 'env'`
    },
    {
      ...OPTION_CONFIG_PRESET.OneOfString([ 'list', 'upload', 'download' ]),
      name: 'mode',
      shortName: 'm',
      description: `should be 'upload', 'download', or 'list'\n'list' do not need [git-branch] or [git-commit-hash]`
    },
    { ...SingleStringPathFormat, name: 'path-pack', shortName: 'p', optional: checkOptional('config', 'upload'), description: `required for mode 'upload'` },
    { ...SingleStringPathFormat, name: 'path-unpack', shortName: 'u', optional: checkOptional('config', 'download'), description: `required for mode 'download'` },
    { ...OPTION_CONFIG_PRESET.SingleString, name: 'aws-access-key-id' },
    { ...OPTION_CONFIG_PRESET.SingleString, name: 'aws-secret-access-key' },
    { ...OPTION_CONFIG_PRESET.SingleString, name: 'aws-region', description: `S3 region name, sample: 'cn-north-1'` },
    { ...OPTION_CONFIG_PRESET.SingleString, name: 'aws-s3-bucket', description: `S3 bucket name` },
    { ...OPTION_CONFIG_PRESET.SingleString, name: 'git-branch', shortName: 'b', optional: true, description: `git branch name like 'master'\ndefault from 'git symbolic-ref --short HEAD'` },
    { ...OPTION_CONFIG_PRESET.SingleString, name: 'git-commit-hash', shortName: 'h', optional: true, description: `git commit hash like 'a1b2c3d4e5f6' or 'latest', for mode 'download'\ndefault from 'git log -1 --format="%H"'` }
  ]
}

const { parseCLI, parseENV, parseJSON, processOptionMap, formatUsage } = createOptionParser(OPTION_CONFIG)

const parseOption = async () => ({
  optionMap: await parseOptionMap({ parseCLI, parseENV, parseJSON, processOptionMap }),
  getOption,
  getOptionOptional,
  getSingleOption,
  getSingleOptionOptional
})

const exitWithError = (error) => {
  __DEV__ && console.warn(error)
  !__DEV__ && console.warn(formatUsage(error.message || error.toString()))
  process.exit(1)
}

export { parseOption, exitWithError }
