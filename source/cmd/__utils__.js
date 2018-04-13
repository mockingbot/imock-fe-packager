import { resolve, relative } from 'path'
import { execSync } from 'child_process'
import { readFileSync } from 'fs'
import { run } from 'dr-js/module/node/system/Run'
import { toPosixPath } from 'dr-js/module/node/file/function'
import { getFileList } from 'dr-js/module/node/file/Directory'
import { getEntityTagByContentHash } from 'dr-js/module/node/module/EntityTag'

const getGitBranch = () => execSync('git symbolic-ref --short HEAD').toString().replace(/\s/g, '')
const getGitCommitHash = () => execSync('git log -1 --format="%H"').toString().replace(/\s/g, '')

const doTarCompress = async (sourcePath, outputFileName) => run({ command: 'tar', argList: [ '-czf', outputFileName, '-C', sourcePath, '.' ] }).promise
const doTarExtract = async (sourceFileName, outputPath) => run({ command: 'tar', argList: [ '--strip-components', '1', '-xzf', sourceFileName, '-C', outputPath ] }).promise

const collectPackageHash = async (pathPackage) => {
  const packageHash = []
  for (const filePath of await getFileList(pathPackage)) {
    if (filePath.endsWith('PACKAGE_HASH')) continue
    const path = toPosixPath(relative(pathPackage, filePath))
    const hash = getEntityTagByContentHash(readFileSync(filePath))
    packageHash.push([ path, hash ])
  }
  return packageHash
}
const checkPackageHash = async (pathPackage, packageHash) => {
  for (const [ path, hash ] of packageHash) {
    const filePath = resolve(pathPackage, path)
    const checkHash = getEntityTagByContentHash(readFileSync(filePath))
    if (checkHash !== hash) throw new Error(`[checkPackageHash] expect file "${filePath}" hash to be: ${hash}, get: ${checkHash}`)
  }
}

export {
  getGitBranch,
  getGitCommitHash,
  doTarCompress,
  doTarExtract,
  collectPackageHash,
  checkPackageHash
}
