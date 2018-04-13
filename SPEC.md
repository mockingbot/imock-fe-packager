# Specification

* [Bin Option Format](#bin-option-format)

#### Bin Option Format
📄 [source-bin/option.js](source-bin/option.js)
> ```
> CLI Usage:
>   --config -c [OPTIONAL] [ARGUMENT=1]
>       # from JSON: set to 'path/to/config.json'
>       # from ENV: set to 'env'
>   --help -h [OPTIONAL]
>       set to enable
>   --version -v [OPTIONAL]
>       set to enable
>   --mode -m [OPTIONAL] [ARGUMENT=1]
>       one of:
>         list upload
>         upload-file download
>         download-file delete-outdated
>         delete-file
>     --path-pack -p [OPTIONAL-CHECK] [ARGUMENT=1]
>         required for 'upload'
>     --path-unpack -u [OPTIONAL-CHECK] [ARGUMENT=1]
>         required for 'download'
>     --path-file -P [OPTIONAL-CHECK] [ARGUMENT=1]
>         required for 'upload-file' or 'download-file'
>     --key-file -K [OPTIONAL-CHECK] [ARGUMENT=1]
>         required for 'upload-file' or 'download-file' or 'delete-file'
>     --list-key-prefix [OPTIONAL-CHECK] [ARGUMENT=1]
>         for 'list'
>     --upload-public-read-access [OPTIONAL-CHECK]
>         for 'upload', 'upload-list', default: 'false'
>     --delete-outdated-time [OPTIONAL-CHECK] [ARGUMENT=1]
>         in seconds, for 'delete-outdated', default: '2592000' (30 day)
>     --service-aws -a [OPTIONAL-CHECK]
>         set to enable
>       --aws-access-key-id [OPTIONAL-CHECK] [ARGUMENT=1]
>       --aws-secret-access-key [OPTIONAL-CHECK] [ARGUMENT=1]
>       --aws-region [OPTIONAL-CHECK] [ARGUMENT=1]
>           S3 region name, sample: 'cn-north-1'
>       --aws-s3-bucket [OPTIONAL-CHECK] [ARGUMENT=1]
>           S3 bucket name
>     --service-tc -t [OPTIONAL-CHECK]
>         set to enable
>       --tc-app-id [OPTIONAL-CHECK] [ARGUMENT=1]
>       --tc-secret-id [OPTIONAL-CHECK] [ARGUMENT=1]
>       --tc-secret-key [OPTIONAL-CHECK] [ARGUMENT=1]
>       --tc-region [OPTIONAL-CHECK] [ARGUMENT=1]
>           region name, sample: 'ap-hongkong'
>       --tc-bucket [OPTIONAL-CHECK] [ARGUMENT=1]
>           bucket name
>     --git-branch -B [OPTIONAL-CHECK] [ARGUMENT=1]
>         git branch name like 'master'
>         default use 'git symbolic-ref --short HEAD'
>     --git-commit-hash -H [OPTIONAL-CHECK] [ARGUMENT=1]
>         git commit hash like 'a1b2c3d4', or 'latest' for 'download'
>         default use 'git log -1 --format="%H"'
> ENV Usage:
>   "
>     #!/usr/bin/env bash
>     export PACKAGER_CONFIG="[OPTIONAL] [ARGUMENT=1]"
>     export PACKAGER_HELP="[OPTIONAL]"
>     export PACKAGER_VERSION="[OPTIONAL]"
>     export PACKAGER_MODE="[OPTIONAL] [ARGUMENT=1]"
>     export PACKAGER_PATH_PACK="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_PATH_UNPACK="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_PATH_FILE="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_KEY_FILE="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_LIST_KEY_PREFIX="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_UPLOAD_PUBLIC_READ_ACCESS="[OPTIONAL-CHECK]"
>     export PACKAGER_DELETE_OUTDATED_TIME="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_SERVICE_AWS="[OPTIONAL-CHECK]"
>     export PACKAGER_AWS_ACCESS_KEY_ID="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_AWS_SECRET_ACCESS_KEY="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_AWS_REGION="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_AWS_S3_BUCKET="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_SERVICE_TC="[OPTIONAL-CHECK]"
>     export PACKAGER_TC_APP_ID="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_TC_SECRET_ID="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_TC_SECRET_KEY="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_TC_REGION="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_TC_BUCKET="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_GIT_BRANCH="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_GIT_COMMIT_HASH="[OPTIONAL-CHECK] [ARGUMENT=1]"
>   "
> JSON Usage:
>   {
>     "config": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "help": [ "[OPTIONAL]" ],
>     "version": [ "[OPTIONAL]" ],
>     "mode": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "pathPack": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "pathUnpack": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "pathFile": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "keyFile": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "listKeyPrefix": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "uploadPublicReadAccess": [ "[OPTIONAL-CHECK]" ],
>     "deleteOutdatedTime": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "serviceAws": [ "[OPTIONAL-CHECK]" ],
>     "awsAccessKeyId": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "awsSecretAccessKey": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "awsRegion": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "awsS3Bucket": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "serviceTc": [ "[OPTIONAL-CHECK]" ],
>     "tcAppId": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "tcSecretId": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "tcSecretKey": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "tcRegion": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "tcBucket": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "gitBranch": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "gitCommitHash": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>   }
> ```
