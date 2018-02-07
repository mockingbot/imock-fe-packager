import { createOptionParser } from 'dr-js/module/common/module/Option/Parser'
import { ConfigPreset, getOptionalFormatValue } from 'dr-js/module/common/module/Option/Preset'
import { parseOptionMap, createOptionGetter } from 'dr-js/module/node/module/Option'

const { SingleString, OneOfString, BooleanFlag, Config } = ConfigPreset

const OPTION_CONFIG = {
  prefixENV: 'packager',
  formatList: [
    Config,
    {
      ...OneOfString([ 'list', 'upload', 'download' ]),
      name: 'mode',
      shortName: 'm'
    },
    { ...SingleString, isPath: true, optional: getOptionalFormatValue('mode', 'upload'), name: 'path-pack', shortName: 'p', description: `required for mode 'upload'` },
    { ...SingleString, isPath: true, optional: getOptionalFormatValue('mode', 'download'), name: 'path-unpack', shortName: 'u', description: `required for mode 'download'` },
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
    { ...SingleString, optional: true, name: 'git-branch', shortName: 'b', description: `git branch name like 'master'\ndefault from 'git symbolic-ref --short HEAD'` },
    { ...SingleString, optional: true, name: 'git-commit-hash', shortName: 'h', description: `git commit hash like 'a1b2c3d4e5f6' or 'latest', for mode 'download'\ndefault from 'git log -1 --format="%H"'` }
  ]
}

const { parseCLI, parseENV, parseJSON, processOptionMap, formatUsage } = createOptionParser(OPTION_CONFIG)

const parseOption = async () => createOptionGetter(await parseOptionMap({ parseCLI, parseENV, parseJSON, processOptionMap }))

export { parseOption, formatUsage }
