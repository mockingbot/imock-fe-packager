import { createOptionParser } from 'dr-js/module/common/module/OptionParser'
import { OPTION_CONFIG_PRESET } from 'dr-js/module/common/module/OptionParserConfigPreset'
import { parseOptionMap, createOptionGetter } from 'dr-js/module/node/module/ParseOption'

const { SingleString, OneOfString } = OPTION_CONFIG_PRESET
const SingleStringPath = { ...SingleString, isPath: true }

const checkOptional = (name, value) => (optionMap) => optionMap[ name ].argumentList[ 0 ] !== value

const OPTION_CONFIG = {
  prefixENV: 'packager',
  formatList: [
    {
      ...SingleString,
      optional: true,
      name: 'config',
      shortName: 'c',
      description: `# from JSON: set to 'path/to/config.json'\n# from ENV: set to 'env'`
    },
    {
      ...OneOfString([ 'list', 'upload', 'download' ]),
      name: 'mode',
      shortName: 'm'
    },
    { ...SingleStringPath, optional: checkOptional('mode', 'upload'), name: 'path-pack', shortName: 'p', description: `required for mode 'upload'` },
    { ...SingleStringPath, optional: checkOptional('mode', 'download'), name: 'path-unpack', shortName: 'u', description: `required for mode 'download'` },
    {
      optional: true,
      name: 'service-aws',
      shortName: 'a',
      argumentCount: '0+',
      extendFormatList: [
        { ...SingleString, name: 'aws-access-key-id' },
        { ...SingleString, name: 'aws-secret-access-key' },
        { ...SingleString, name: 'aws-region', description: `S3 region name, sample: 'cn-north-1'` },
        { ...SingleString, name: 'aws-s3-bucket', description: `S3 bucket name` }
      ]
    },
    {
      optional: true,
      name: 'service-tc',
      shortName: 't',
      argumentCount: '0+',
      extendFormatList: [
        { ...SingleString, name: 'tc-app-id' },
        { ...SingleString, name: 'tc-secret-id' },
        { ...SingleString, name: 'tc-secret-key' },
        { ...SingleString, name: 'tc-region', description: `region name, sample: 'ap-hongkong'` },
        { ...SingleString, name: 'tc-bucket', description: `bucket name` }
      ]
    },
    { ...SingleString, optional: true, name: 'git-branch', shortName: 'b', description: `git branch name like 'master'\ndefault from 'git symbolic-ref --short HEAD'` },
    { ...SingleString, optional: true, name: 'git-commit-hash', shortName: 'h', description: `git commit hash like 'a1b2c3d4e5f6' or 'latest', for mode 'download'\ndefault from 'git log -1 --format="%H"'` }
  ]
}

const { parseCLI, parseENV, parseJSON, processOptionMap, formatUsage } = createOptionParser(OPTION_CONFIG)

const parseOption = async () => createOptionGetter(await parseOptionMap({ parseCLI, parseENV, parseJSON, processOptionMap }))

export { parseOption, formatUsage }
