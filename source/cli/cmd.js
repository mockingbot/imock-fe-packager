import { runCommand } from 'source/__utils__'

const getGitBranch = async () => (await runCommand('git symbolic-ref --short HEAD')).stdoutString.replace('\n', '')
const getGitCommitHash = async () => (await runCommand('git log -1 --format="%H"')).stdoutString.replace('\n', '')

const doTarCompress = async (sourcePath = './', outputFileName = 'pack.tar.gz') => runCommand(`tar -czf "${outputFileName}" -C ${sourcePath} .`)
const doTarExtract = async (sourceFileName = 'pack.tar.gz', outputPath = './') => runCommand(`tar --strip-components 1 -xzf "${sourceFileName}" -C ${outputPath}`)

export {
  getGitBranch,
  getGitCommitHash,
  doTarCompress,
  doTarExtract
}
