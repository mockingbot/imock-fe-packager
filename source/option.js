import { Preset, getOptionalFormatValue, prepareOption } from 'dr-js/module/node/module/Option/preset'

const { Config, pickOneOf, parseCompactList } = Preset

const OPTION_CONFIG = {
  prefixENV: 'packager',
  formatList: [
    Config,
    ...parseCompactList(
      'help,h/T|show full help, or human readable output',
      'version,v/T|show version',
      'quiet,q/T|less log',
      [ 'mode,m', {
        ...pickOneOf([
          'list',
          'upload', 'upload-file',
          'download', 'download-file',
          'delete-outdated', 'delete-file'
        ]),
        optional: true,
        extendFormatList: parseCompactList(
          [ `path-pack,p/SP|required for 'upload'`, { optional: getOptionalFormatValue('mode', 'upload') } ],
          [ `path-unpack,u/SP|required for 'download'`, { optional: getOptionalFormatValue('mode', 'download') } ],
          [ `path-file,P/SP|required for 'upload-file' or 'download-file'`, { optional: getOptionalFormatValue('mode', 'upload-file', 'download-file') } ],
          [ `key-file,K/SS|required for 'upload-file' or 'download-file' or 'delete-file'`, { optional: getOptionalFormatValue('mode', 'upload-file', 'download-file', 'delete-file') } ],
          `list-key-prefix/SS,O|for 'list'`,
          `upload-public-read-access/T|for 'upload', 'upload-list', default: 'false'`,
          `delete-outdated-time/SI,O|in seconds, for 'delete-outdated', default: '${30 * 24 * 60 * 60}' (30 day)`,
          [ `service-aws,a/T`, parseCompactList(
            `aws-access-key-id/SS`,
            `aws-access-access-key/SS`,
            `aws-region/SS|region name, sample: 'cn-north-1'`,
            `aws-s3-bucket,aws-bucket/SS|bucket name` // TODO: 0.3.0 remove `aws-s3-bucket`
          ) ],
          [ `service-oss,o/T`, parseCompactList(
            `oss-access-key-id/SS`,
            `oss-access-key-secret/SS`,
            `oss-region/SS|region name, sample: 'oss-cn-hongkong'`,
            `oss-bucket/SS|bucket name`
          ) ],
          [ `service-tc,t/T`, parseCompactList(
            `tc-app-id/SS`,
            `tc-secret-id/SS`,
            `tc-secret-key/SS`,
            `tc-region/SS|region name, sample: 'ap-hongkong'`,
            `tc-bucket/SS|bucket name`
          ) ],
          [ `service-custom,C/T|custom server for file upload/download/delete, no list`, parseCompactList(
            `custom-auth-file/SP`,
            `custom-path-action-url/SS`,
            `custom-file-upload-url/SS`,
            `custom-file-download-url/SS`,
            `custom-fetch-timeout/SI,O|in msec, default 30sec`,
            `custom-bucket/SS|bucket name`
          ) ],
          `git-branch,B/SS,O|git branch name like 'master'\ndefault use 'git symbolic-ref --short HEAD'`,
          `git-commit-hash,H/SS,O|git commit hash like 'a1b2c3d4', or 'latest' for 'download'\ndefault use 'git log -1 --format="%H"'`
        )
      } ]
    )
  ]
}

const { parseOption, formatUsage } = prepareOption(OPTION_CONFIG)

export { parseOption, formatUsage }
