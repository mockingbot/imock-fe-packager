# imock-fe-packager

Upload/Download compiled webpack files to/from AWS S3.

#### Usage

`[node] + [script.js] + [config.json] + [mode] + [git-branch] + [git-commit-hash]`

Argument:
  - [config.json]: 
     * config file with AWS access info, and packager operate path
  - [mode]: 
     * should be 'upload', 'download', or 'list'
     * 'list' do not need [git-branch] or [git-commit-hash]
  - [git-branch]: 
     * optional, git branch name like 'master'
     * will get from [config.json] or `git symbolic-ref --short HEAD`
  - [git-commit-hash]: 
     * optional, git commit hash like 'a1b2c3d4e5f6', or 'latest' for 'download'
     * will get from [config.json] or `git log -1 --format="%H"`

Example:

```
  [node] [script.js] [config.json] list
  [node] [script.js] [config.json] upload
  [node] [script.js] [config.json] upload [git-branch]
  [node] [script.js] [config.json] upload [git-branch] [git-commit-hash]
  [node] [script.js] [config.json] download
  [node] [script.js] [config.json] download [git-branch]
  [node] [script.js] [config.json] download [git-branch] [git-commit-hash]
  [node] [script.js] [config.json] download [git-branch] latest
```

#### packager-config.json

```json
{
  "== AWS-CONFIG ==": "==============================================",
  "userName": "imock-fe",
  "region": "cn-north-1",
  "accessKeyId": "[HASH-HASH-HASH]",
  "secretAccessKey": "[HASH-HASH-HASH]",
  "consoleLoginLink": "https://mockingbot.signin.amazonaws.cn/console",

  "== PACKAGER-CONFIG ==": "=========================================",
  "IMOCK_FE_PACKAGER": {
    "NAME_AWS_S3_BUCKET": "imock-fe",
    "PATH_PACK": "/absolute/path/ or ./path/relative/to/script.js/",
    "PATH_UNPACK": "/absolute/path/ or ./path/relative/to/script.js/",
    "GIT_BRANCH": "if set: cmd option > priority > auto git search",
    "GIT_COMMIT_HASH": "if set: cmd option > priority > auto git search"
  }
}
```
