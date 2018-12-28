# Specification

* [Bin Option Format](#bin-option-format)

#### Bin Option Format
📄 [source/option.js](source/option.js)
> ```
> CLI Usage:
>   --config --c -c [OPTIONAL] [ARGUMENT=1]
>       from ENV: set to "env"
>       from JS/JSON file: set to "path/to/config.js|json"
>   --help --h -h [OPTIONAL] [ARGUMENT=0+]
>       show full help, or human readable output
>   --version --v -v [OPTIONAL] [ARGUMENT=0+]
>       show version
>   --quiet --q -q [OPTIONAL] [ARGUMENT=0+]
>       less log
>   --mode --m -m [OPTIONAL] [ARGUMENT=1]
>       one of:
>         list upload upload-file download
>         download-file delete-outdated delete-file
>     --path-pack --p -p [OPTIONAL-CHECK] [ARGUMENT=1]
>         required for 'upload'
>     --path-unpack --u -u [OPTIONAL-CHECK] [ARGUMENT=1]
>         required for 'download'
>     --path-file --P -P [OPTIONAL-CHECK] [ARGUMENT=1]
>         required for 'upload-file' or 'download-file'
>     --key-file --K -K [OPTIONAL-CHECK] [ARGUMENT=1]
>         required for 'upload-file' or 'download-file' or 'delete-file'
>     --list-key-prefix [OPTIONAL-CHECK] [ARGUMENT=1]
>         for 'list'
>     --upload-public-read-access [OPTIONAL-CHECK] [ARGUMENT=0+]
>         for 'upload', 'upload-list', default: 'false'
>     --delete-outdated-time [OPTIONAL-CHECK] [ARGUMENT=1]
>         in seconds, for 'delete-outdated', default: '2592000' (30 day)
>     --service-aws --a -a [OPTIONAL-CHECK] [ARGUMENT=0+]
>         set to enable
>       --aws-access-key-id [OPTIONAL-CHECK] [ARGUMENT=1]
>       --aws-access-access-key [OPTIONAL-CHECK] [ARGUMENT=1]
>       --aws-region [OPTIONAL-CHECK] [ARGUMENT=1]
>           region name, sample: 'cn-north-1'
>       --aws-s3-bucket --aws-bucket [OPTIONAL-CHECK] [ARGUMENT=1]
>           bucket name
>     --service-oss --o -o [OPTIONAL-CHECK] [ARGUMENT=0+]
>         set to enable
>       --oss-access-key-id [OPTIONAL-CHECK] [ARGUMENT=1]
>       --oss-access-key-secret [OPTIONAL-CHECK] [ARGUMENT=1]
>       --oss-region [OPTIONAL-CHECK] [ARGUMENT=1]
>           region name, sample: 'oss-cn-hongkong'
>       --oss-bucket [OPTIONAL-CHECK] [ARGUMENT=1]
>           bucket name
>     --service-tc --t -t [OPTIONAL-CHECK] [ARGUMENT=0+]
>         set to enable
>       --tc-app-id [OPTIONAL-CHECK] [ARGUMENT=1]
>       --tc-secret-id [OPTIONAL-CHECK] [ARGUMENT=1]
>       --tc-secret-key [OPTIONAL-CHECK] [ARGUMENT=1]
>       --tc-region [OPTIONAL-CHECK] [ARGUMENT=1]
>           region name, sample: 'ap-hongkong'
>       --tc-bucket [OPTIONAL-CHECK] [ARGUMENT=1]
>           bucket name
>     --service-custom --C -C [OPTIONAL-CHECK] [ARGUMENT=0+]
>         custom server for file upload/download/delete, no list
>       --custom-auth-file [OPTIONAL-CHECK] [ARGUMENT=1]
>       --custom-path-action-url [OPTIONAL-CHECK] [ARGUMENT=1]
>       --custom-file-upload-url [OPTIONAL-CHECK] [ARGUMENT=1]
>       --custom-file-download-url [OPTIONAL-CHECK] [ARGUMENT=1]
>       --custom-fetch-timeout [OPTIONAL-CHECK] [ARGUMENT=1]
>           in msec, default 30sec
>       --custom-bucket [OPTIONAL-CHECK] [ARGUMENT=1]
>           bucket name
>     --git-branch --B -B [OPTIONAL-CHECK] [ARGUMENT=1]
>         git branch name like 'master'
>         default use 'git symbolic-ref --short HEAD'
>     --git-commit-hash --H -H [OPTIONAL-CHECK] [ARGUMENT=1]
>         git commit hash like 'a1b2c3d4', or 'latest' for 'download'
>         default use 'git log -1 --format="%H"'
> ENV Usage:
>   "
>     #!/usr/bin/env bash
>     export PACKAGER_CONFIG="[OPTIONAL] [ARGUMENT=1]"
>     export PACKAGER_HELP="[OPTIONAL] [ARGUMENT=0+]"
>     export PACKAGER_VERSION="[OPTIONAL] [ARGUMENT=0+]"
>     export PACKAGER_QUIET="[OPTIONAL] [ARGUMENT=0+]"
>     export PACKAGER_MODE="[OPTIONAL] [ARGUMENT=1]"
>     export PACKAGER_PATH_PACK="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_PATH_UNPACK="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_PATH_FILE="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_KEY_FILE="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_LIST_KEY_PREFIX="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_UPLOAD_PUBLIC_READ_ACCESS="[OPTIONAL-CHECK] [ARGUMENT=0+]"
>     export PACKAGER_DELETE_OUTDATED_TIME="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_SERVICE_AWS="[OPTIONAL-CHECK] [ARGUMENT=0+]"
>     export PACKAGER_AWS_ACCESS_KEY_ID="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_AWS_ACCESS_ACCESS_KEY="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_AWS_REGION="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_AWS_S3_BUCKET="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_SERVICE_OSS="[OPTIONAL-CHECK] [ARGUMENT=0+]"
>     export PACKAGER_OSS_ACCESS_KEY_ID="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_OSS_ACCESS_KEY_SECRET="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_OSS_REGION="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_OSS_BUCKET="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_SERVICE_TC="[OPTIONAL-CHECK] [ARGUMENT=0+]"
>     export PACKAGER_TC_APP_ID="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_TC_SECRET_ID="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_TC_SECRET_KEY="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_TC_REGION="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_TC_BUCKET="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_SERVICE_CUSTOM="[OPTIONAL-CHECK] [ARGUMENT=0+]"
>     export PACKAGER_CUSTOM_AUTH_FILE="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_CUSTOM_PATH_ACTION_URL="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_CUSTOM_FILE_UPLOAD_URL="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_CUSTOM_FILE_DOWNLOAD_URL="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_CUSTOM_FETCH_TIMEOUT="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_CUSTOM_BUCKET="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_GIT_BRANCH="[OPTIONAL-CHECK] [ARGUMENT=1]"
>     export PACKAGER_GIT_COMMIT_HASH="[OPTIONAL-CHECK] [ARGUMENT=1]"
>   "
> CONFIG Usage:
>   {
>     "config": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "help": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "version": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "quiet": [ "[OPTIONAL] [ARGUMENT=0+]" ],
>     "mode": [ "[OPTIONAL] [ARGUMENT=1]" ],
>     "pathPack": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "pathUnpack": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "pathFile": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "keyFile": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "listKeyPrefix": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "uploadPublicReadAccess": [ "[OPTIONAL-CHECK] [ARGUMENT=0+]" ],
>     "deleteOutdatedTime": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "serviceAws": [ "[OPTIONAL-CHECK] [ARGUMENT=0+]" ],
>     "awsAccessKeyId": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "awsAccessAccessKey": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "awsRegion": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "awsS3Bucket": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "serviceOss": [ "[OPTIONAL-CHECK] [ARGUMENT=0+]" ],
>     "ossAccessKeyId": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "ossAccessKeySecret": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "ossRegion": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "ossBucket": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "serviceTc": [ "[OPTIONAL-CHECK] [ARGUMENT=0+]" ],
>     "tcAppId": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "tcSecretId": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "tcSecretKey": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "tcRegion": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "tcBucket": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "serviceCustom": [ "[OPTIONAL-CHECK] [ARGUMENT=0+]" ],
>     "customAuthFile": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "customPathActionUrl": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "customFileUploadUrl": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "customFileDownloadUrl": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "customFetchTimeout": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "customBucket": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "gitBranch": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>     "gitCommitHash": [ "[OPTIONAL-CHECK] [ARGUMENT=1]" ],
>   }
> ```
