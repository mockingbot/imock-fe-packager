# imock-fe-packager

Upload/Download compiled webpack files to/from AWS S3.

#### Usage

CLI Usage:

`[node] + [script] + [gnu-command-line-format]`

    --mode -m [ARGUMENT=1]:
      should be 'upload', 'download', or 'list'
      'list' do not need [git-branch] or [git-commit-hash]
    --config -c [OPTIONAL] [ARGUMENT=1]:
      # from JSON
        config file path with AWS access info, and packager operate path
      # from ENV
        set to 'env' to collect from process.env, required keys:
          aws: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET
          packager: PACKAGER_PATH_PACK, PACKAGER_PATH_UNPACK
        optional keys:
          packager: PACKAGER_GIT_BRANCH, PACKAGER_GIT_COMMIT_HASH
    --path-pack -p [OPTIONAL] [ARGUMENT=1]:
      required when 'upload'. /absolute/path/ or ./path/relative/to/packager-config.json or cwd/
    --path-unpack -u [OPTIONAL] [ARGUMENT=1]:
      required when 'download'. /absolute/path/ or ./path/relative/to/packager-config.json or cwd/
    --aws-access-key-id [ARGUMENT=1]
    --aws-secret-access-key [ARGUMENT=1]
    --aws-region [ARGUMENT=1]:
      should be 'cn-north-1'
    --aws-s3-bucket [ARGUMENT=1]:
      should be 'imock-fe'
    --git-branch -b [OPTIONAL] [ARGUMENT=1]:
      git branch name like 'master'
      will get from [config] or 'git symbolic-ref --short HEAD'
    --git-commit-hash -h [OPTIONAL] [ARGUMENT=1]:
      git commit hash like 'a1b2c3d4e5f6', or 'latest' for 'download'
      will get from [config] or 'git log -1 --format="%H"'

Example:

```
  [node] [script] --config packager-config.json --mode list
  [node] [script] --config=packager-config.json --mode=list
  [node] [script] -c packager-config.json -m list
  [node] [script] -c=packager-config.json -m=list
  [node] [script] -c=env -m=list
  [node] [script] -c packager-config.json -m upload
  [node] [script] -c packager-config.json -m upload -b git-branch
  [node] [script] -c packager-config.json -m upload -b git-branch -h git-commit-hash
  [node] [script] -c packager-config.json -m download
  [node] [script] -c packager-config.json -m download -b git-branch
  [node] [script] -c packager-config.json -m download -b git-branch -h git-commit-hash
  [node] [script] -c packager-config.json -m download -b git-branch -h latest
```

#### packager-config.json

```json
{
  "mode": "list|upload|download",
  "pathPack": "/absolute/path/ or ./path/relative/to/packager-config.json/",
  "pathUnpack": "/absolute/path/ or ./path/relative/to/packager-config.json/",
  "awsAccessKeyId": "HASH-HASH-HASH",
  "awsSecretAccessKey": "HASH-HASH-HASH",
  "awsRegion": "cn-north-1",
  "awsS3Bucket": "imock-fe",
  "gitBranch": "if set: cmd option > priority > auto git search",
  "gitCommitHash": "if set: cmd option > priority > auto git search"
}
```
#### packager env

```bash
export PACKAGER_MODE="list|upload|download"
export PACKAGER_PATH_PACK="/absolute/path/ or ./path/relative/to/cwd/"
export PACKAGER_PATH_UNPACK="/absolute/path/ or ./path/relative/to/cwd/"
export PACKAGER_AWS_ACCESS_KEY_ID="HASH-HASH-HASH"
export PACKAGER_AWS_SECRET_ACCESS_KEY="HASH-HASH-HASH"
export PACKAGER_AWS_REGION="cn-north-1"
export PACKAGER_AWS_S3_BUCKET="imock-fe"
export PACKAGER_GIT_BRANCH="if set: cmd option > priority > auto git search"
export PACKAGER_GIT_COMMIT_HASH="if set: cmd option > priority > auto git search"
```
