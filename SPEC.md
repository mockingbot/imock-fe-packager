# Specification

* [Bin Option Format](#bin-option-format)

#### Bin Option Format
📄 [source-bin/option.js](source-bin/option.js)
> ```
> CLI Usage:
>   --config -c [OPTIONAL] [ARGUMENT=1]:
>       # from JSON: set to 'path/to/config.json'
>       # from ENV: set to 'env'
>   --help -h [OPTIONAL]:
>       set to enable
>   --version -v [OPTIONAL]:
>       set to enable
>   --mode -m [OPTIONAL] [ARGUMENT=1]:
>       one of:
>         list upload
>         upload-file download
>         download-file delete-outdated
>         delete-file
>     --path-pack -p [OPTIONAL-CHECK] [ARGUMENT=1]:
>         required for 'upload'
>     --path-unpack -u [OPTIONAL-CHECK] [ARGUMENT=1]:
>         required for 'download'
>     --path-file -P [OPTIONAL-CHECK] [ARGUMENT=1]:
>         required for 'upload-file' or 'download-file'
>     --key-file -K [OPTIONAL-CHECK] [ARGUMENT=1]:
>         required for 'upload-file' or 'download-file' or 'delete-file'
>     --list-key-prefix [OPTIONAL-CHECK] [ARGUMENT=1]:
>         for 'list'
>     --upload-public-read-access [OPTIONAL-CHECK]:
>         for 'upload', 'upload-list', default: 'false'
>     --delete-outdated-time [OPTIONAL-CHECK] [ARGUMENT=1]:
>         in seconds, for 'delete-outdated', default: '2592000' (30 day)
>     --service-aws -a [OPTIONAL-CHECK]:
>         set to enable
>       --aws-access-key-id [OPTIONAL-CHECK] [ARGUMENT=1]
>       --aws-secret-access-key [OPTIONAL-CHECK] [ARGUMENT=1]
>       --aws-region [OPTIONAL-CHECK] [ARGUMENT=1]:
>           S3 region name, sample: 'cn-north-1'
>       --aws-s3-bucket [OPTIONAL-CHECK] [ARGUMENT=1]:
>           S3 bucket name
>     --service-tc -t [OPTIONAL-CHECK]:
>         set to enable
>       --tc-app-id [OPTIONAL-CHECK] [ARGUMENT=1]
>       --tc-secret-id [OPTIONAL-CHECK] [ARGUMENT=1]
>       --tc-secret-key [OPTIONAL-CHECK] [ARGUMENT=1]
>       --tc-region [OPTIONAL-CHECK] [ARGUMENT=1]:
>           region name, sample: 'ap-hongkong'
>       --tc-bucket [OPTIONAL-CHECK] [ARGUMENT=1]:
>           bucket name
>     --git-branch -B [OPTIONAL-CHECK] [ARGUMENT=1]:
>         git branch name like 'master'
>         default use 'git symbolic-ref --short HEAD'
>     --git-commit-hash -H [OPTIONAL-CHECK] [ARGUMENT=1]:
>         git commit hash like 'a1b2c3d4', or 'latest' for 'download'
>         default use 'git log -1 --format="%H"'
> ENV Usage:
>   "
>     #!/usr/bin/env bash
>     export PACKAGER_CONFIG="config [OPTIONAL] [ARGUMENT=1]"
>     export PACKAGER_HELP="help [OPTIONAL]"
>     export PACKAGER_VERSION="version [OPTIONAL]"
>     export PACKAGER_MODE="mode [OPTIONAL] [ARGUMENT=1]"
>     export PACKAGER_PATH_PACK="path-pack [OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_PATH_UNPACK="path-unpack [OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_PATH_FILE="path-file [OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_KEY_FILE="key-file [OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_LIST_KEY_PREFIX="list-key-prefix [OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_UPLOAD_PUBLIC_READ_ACCESS="upload-public-read-access [OPTIONAL-CHECK]"
>     export PACKAGER_DELETE_OUTDATED_TIME="delete-outdated-time [OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_SERVICE_AWS="service-aws [OPTIONAL-CHECK]"
>     export PACKAGER_AWS_ACCESS_KEY_ID="aws-access-key-id [OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_AWS_SECRET_ACCESS_KEY="aws-secret-access-key [OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_AWS_REGION="aws-region [OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_AWS_S3_BUCKET="aws-s3-bucket [OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_SERVICE_TC="service-tc [OPTIONAL-CHECK]"
>     export PACKAGER_TC_APP_ID="tc-app-id [OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_TC_SECRET_ID="tc-secret-id [OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_TC_SECRET_KEY="tc-secret-key [OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_TC_REGION="tc-region [OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_TC_BUCKET="tc-bucket [OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_GIT_BRANCH="git-branch [OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_GIT_COMMIT_HASH="git-commit-hash [OPTIONAL-CHECK] [ARGUMENT=1]"
>   "
> JSON Usage:
>   {
>     "config": [ "config [OPTIONAL] [ARGUMENT=1]" ]
>     "help": [ "help [OPTIONAL]" ]
>     "version": [ "version [OPTIONAL]" ]
>     "mode": [ "mode [OPTIONAL] [ARGUMENT=1]" ]
>     "pathPack": [ "path-pack [OPTIONAL-CHECK] [ARGUMENT=1]" ]
>     "pathUnpack": [ "path-unpack [OPTIONAL-CHECK] [ARGUMENT=1]" ]
>     "pathFile": [ "path-file [OPTIONAL-CHECK] [ARGUMENT=1]" ]
>     "keyFile": [ "key-file [OPTIONAL-CHECK] [ARGUMENT=1]" ]
>     "listKeyPrefix": [ "list-key-prefix [OPTIONAL-CHECK] [ARGUMENT=1]" ]
>     "uploadPublicReadAccess": [ "upload-public-read-access [OPTIONAL-CHECK]" ]
>     "deleteOutdatedTime": [ "delete-outdated-time [OPTIONAL-CHECK] [ARGUMENT=1]" ]
>     "serviceAws": [ "service-aws [OPTIONAL-CHECK]" ]
>     "awsAccessKeyId": [ "aws-access-key-id [OPTIONAL-CHECK] [ARGUMENT=1]" ]
>     "awsSecretAccessKey": [ "aws-secret-access-key [OPTIONAL-CHECK] [ARGUMENT=1]" ]
>     "awsRegion": [ "aws-region [OPTIONAL-CHECK] [ARGUMENT=1]" ]
>     "awsS3Bucket": [ "aws-s3-bucket [OPTIONAL-CHECK] [ARGUMENT=1]" ]
>     "serviceTc": [ "service-tc [OPTIONAL-CHECK]" ]
>     "tcAppId": [ "tc-app-id [OPTIONAL-CHECK] [ARGUMENT=1]" ]
>     "tcSecretId": [ "tc-secret-id [OPTIONAL-CHECK] [ARGUMENT=1]" ]
>     "tcSecretKey": [ "tc-secret-key [OPTIONAL-CHECK] [ARGUMENT=1]" ]
>     "tcRegion": [ "tc-region [OPTIONAL-CHECK] [ARGUMENT=1]" ]
>     "tcBucket": [ "tc-bucket [OPTIONAL-CHECK] [ARGUMENT=1]" ]
>     "gitBranch": [ "git-branch [OPTIONAL-CHECK] [ARGUMENT=1]" ]
>     "gitCommitHash": [ "git-commit-hash [OPTIONAL-CHECK] [ARGUMENT=1]" ]
>   }
> ```
