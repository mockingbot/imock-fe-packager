import { createOptionParser } from 'dr-js/module/common/module/Option/Parser'
import { ConfigPreset, getOptionalFormatValue } from 'dr-js/module/common/module/Option/Preset'
import { parseOptionMap, createOptionGetter } from 'dr-js/module/node/module/Option'

const { SingleString, SingleInteger, OneOfString, BooleanFlag, Config } = ConfigPreset

const OPTION_CONFIG = {
  prefixENV: 'packager',
  prefixJSON: 'packager',
  formatList: [
    Config,
    { ...BooleanFlag, name: 'help', shortName: 'h' },
    { ...BooleanFlag, name: 'version', shortName: 'v' },
    {
      ...OneOfString([
        'list',
        'upload', 'upload-file',
        'download', 'download-file',
        'delete-outdated', 'delete-file'
      ]),
      optional: true,
      name: 'mode',
      shortName: 'm',
      extendFormatList: [
        { ...SingleString, isPath: true, optional: getOptionalFormatValue('mode', 'upload'), name: 'path-pack', shortName: 'p', description: `required for 'upload'` },
        { ...SingleString, isPath: true, optional: getOptionalFormatValue('mode', 'download'), name: 'path-unpack', shortName: 'u', description: `required for 'download'` },
        { ...SingleString, isPath: true, optional: getOptionalFormatValue('mode', 'upload-file', 'download-file'), name: 'path-file', shortName: 'P', description: `required for 'upload-file' or 'download-file'` },
        { ...SingleString, optional: getOptionalFormatValue('mode', 'upload-file', 'download-file', 'delete-file'), name: 'key-file', shortName: 'K', description: `required for 'upload-file' or 'download-file' or 'delete-file'` },
        { ...SingleString, optional: true, name: 'list-key-prefix', description: `for 'list'` },
        { ...BooleanFlag, name: 'upload-public-read-access', description: `for 'upload', 'upload-list', default: 'false'` },
        { ...SingleInteger, optional: true, name: 'delete-outdated-time', description: `in seconds, for 'delete-outdated', default: '${30 * 24 * 60 * 60}' (30 day)` },
        {
          ...BooleanFlag,
          name: 'service-aws',
          shortName: 'a',
          extendFormatList: [
            { ...SingleString, name: 'aws-access-key-id' },
            { ...SingleString, name: 'aws-secret-access-key' },
            { ...SingleString, name: 'aws-region', description: `S3 region name, sample: 'cn-north-1'` },
            { ...SingleString, name: 'aws-s3-bucket', description: `S3 bucket name` }
          ]
        },
        {
          ...BooleanFlag,
          name: 'service-tc',
          shortName: 't',
          extendFormatList: [
            { ...SingleString, name: 'tc-app-id' },
            { ...SingleString, name: 'tc-secret-id' },
            { ...SingleString, name: 'tc-secret-key' },
            { ...SingleString, name: 'tc-region', description: `region name, sample: 'ap-hongkong'` },
            { ...SingleString, name: 'tc-bucket', description: `bucket name` }
          ]
        },
        { ...SingleString, optional: true, name: 'git-branch', shortName: 'B', description: `git branch name like 'master'\ndefault use 'git symbolic-ref --short HEAD'` },
        { ...SingleString, optional: true, name: 'git-commit-hash', shortName: 'H', description: `git commit hash like 'a1b2c3d4', or 'latest' for 'download'\ndefault use 'git log -1 --format="%H"'` }
      ]
    }
  ]
}

const { parseCLI, parseENV, parseJSON, processOptionMap, formatUsage } = createOptionParser(OPTION_CONFIG)

const parseOption = async () => createOptionGetter(await parseOptionMap({ parseCLI, parseENV, parseJSON, processOptionMap }))

export { parseOption, formatUsage }
