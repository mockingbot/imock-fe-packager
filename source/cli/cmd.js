import nodeModulePath from 'path'
import { unlink, readFile, writeFile, runCommand, formatSize, stringIndentLine } from 'source/__utils__'

const getGitBranch = async () => (await runCommand('git symbolic-ref --short HEAD')).stdoutString.replace('\n', '')
const getGitCommitHash = async () => (await runCommand('git log -1 --format="%H"')).stdoutString.replace('\n', '')

const doTarCompress = async (sourcePath = './', outputFileName = 'pack.tar.gz') => runCommand(`tar -czf "${outputFileName}" -C ${sourcePath} .`)
const doTarExtract = async (sourceFileName = 'pack.tar.gz', outputPath = './') => runCommand(`tar --strip-components 1 -xzf "${sourceFileName}" -C ${outputPath}`)

const doList = async (AWSInstance) => {
  const contentList = await AWSInstance.downloadBufferList()
  contentList.forEach((v) => (v.LastModifiedDate = new Date(v.LastModified)))
  contentList.sort((a, b) => (b.LastModifiedDate - a.LastModifiedDate)) // bigger time first
  const listOutputString = contentList.map(({ Key, Size, LastModifiedDate, ETag }) => `${ETag} | ${LastModifiedDate.toISOString()} | ${Key} | ${formatSize(Size)}`).join('\n')
  console.log(`[List]\n${stringIndentLine(listOutputString, '  ')}`)
}

const doUpload = async (AWSInstance, { CONTENT_PACKAGE_INFO, NAME_TAR_GZ, NAME_TAR_GZ_LATEST, PATH_PACK }) => {
  await writeFile(nodeModulePath.join(PATH_PACK, 'PACKAGE_INFO'), CONTENT_PACKAGE_INFO)
  await doTarCompress(PATH_PACK, NAME_TAR_GZ)
  const buffer = await readFile(NAME_TAR_GZ)
  console.log(`[Upload] packed from '${PATH_PACK}', size: ${formatSize(buffer.length)}`)
  await AWSInstance.uploadBufferToBucket(NAME_TAR_GZ, buffer)
  await AWSInstance.duplicateBufferInBucket(NAME_TAR_GZ_LATEST, NAME_TAR_GZ)
  await unlink(NAME_TAR_GZ)
  console.log(`[Upload] uploaded '${NAME_TAR_GZ}' and '${NAME_TAR_GZ_LATEST}'`)
}

const doDownload = async (AWSInstance, { NAME_TAR_GZ, PATH_UNPACK }) => {
  let buffer = null
  try {
    buffer = await AWSInstance.downloadBufferFromBucket(NAME_TAR_GZ)
    console.log(`[Download] downloaded '${NAME_TAR_GZ}', size: ${formatSize(buffer.length)}`)
  } catch (error) { throw new Error(`[Download] failed to get file: '${NAME_TAR_GZ}', error: ${error.message}`) }
  await writeFile(NAME_TAR_GZ, buffer)
  await doTarExtract(NAME_TAR_GZ, PATH_UNPACK)
  await unlink(NAME_TAR_GZ)
  console.log(`[Download] unpacked to '${PATH_UNPACK}'`)
}

export {
  getGitBranch,
  getGitCommitHash,

  doList,
  doUpload,
  doDownload
}
