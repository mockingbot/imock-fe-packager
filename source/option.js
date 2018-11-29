import { getOptionalFormatValue } from 'dr-js/module/common/module/Option/preset'
import { ConfigPresetNode, prepareOption } from 'dr-js/module/node/module/Option'

const { SingleString, SingleInteger, OneOfString, SinglePath, BooleanFlag, Config } = ConfigPresetNode

const OPTION_CONFIG = {
  prefixENV: 'packager',
  formatList: [
    Config,
    { ...BooleanFlag, name: 'help', shortName: 'h' },
    { ...BooleanFlag, name: 'version', shortName: 'v' },
    { ...BooleanFlag, name: 'quiet', shortName: 'q', description: `reduce most output` },
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
        { ...SinglePath, optional: getOptionalFormatValue('mode', 'upload'), name: 'path-pack', shortName: 'p', description: `required for 'upload'` },
        { ...SinglePath, optional: getOptionalFormatValue('mode', 'download'), name: 'path-unpack', shortName: 'u', description: `required for 'download'` },
        { ...SinglePath, optional: getOptionalFormatValue('mode', 'upload-file', 'download-file'), name: 'path-file', shortName: 'P', description: `required for 'upload-file' or 'download-file'` },
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
            { ...SingleString, name: 'aws-region', description: `region name, sample: 'cn-north-1'` },
            { ...SingleString, name: 'aws-s3-bucket', aliasNameList: [ 'aws-bucket' ], description: `bucket name` } // TODO: 0.3.0 remove `aws-s3-bucket`
          ]
        },
        {
          ...BooleanFlag,
          name: 'service-oss',
          shortName: 'o',
          extendFormatList: [
            { ...SingleString, name: 'oss-access-key-id' },
            { ...SingleString, name: 'oss-access-key-secret' },
            { ...SingleString, name: 'oss-region', description: `region name, sample: 'oss-cn-hongkong'` },
            { ...SingleString, name: 'oss-bucket', description: `bucket name` }
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
        {
          ...BooleanFlag,
          name: 'service-custom',
          shortName: 'C',
          description: `custom server for file upload/download/delete, no list`,
          extendFormatList: [
            { ...SinglePath, name: 'custom-auth-file' },
            { ...SingleString, name: 'custom-path-action-url' },
            { ...SingleString, name: 'custom-file-upload-url' },
            { ...SingleString, name: 'custom-file-download-url' },
            { ...SingleString, name: 'custom-bucket', description: `bucket name` }
          ]
        },
        { ...SingleString, optional: true, name: 'git-branch', shortName: 'B', description: `git branch name like 'master'\ndefault use 'git symbolic-ref --short HEAD'` },
        { ...SingleString, optional: true, name: 'git-commit-hash', shortName: 'H', description: `git commit hash like 'a1b2c3d4', or 'latest' for 'download'\ndefault use 'git log -1 --format="%H"'` }
      ]
    }
  ]
}

const { parseOption, formatUsage } = prepareOption(OPTION_CONFIG)

export { parseOption, formatUsage }
