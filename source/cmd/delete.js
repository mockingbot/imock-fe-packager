const DEFAULT_OUTDATED_TIME = 30 * 24 * 60 * 60 // 30 day, in seconds
const doDeleteOutdated = async (bucketService, { outdatedTime = DEFAULT_OUTDATED_TIME }, log) => {
  const maxDeleteTimestamp = Date.now() - outdatedTime * 1000
  const { bufferList } = await bucketService.getBufferList()
  const deleteKeyList = bufferList
    .filter((v) => (maxDeleteTimestamp >= new Date(v.lastModified).getTime()))
    .map(({ key }) => key)
  if (deleteKeyList.length) {
    await bucketService.deleteBufferList(deleteKeyList)
    log(`[DeleteOutdated] deleted ${deleteKeyList.length} outdated buffer from ${bufferList.length} listed since ${new Date(maxDeleteTimestamp).toISOString()}`)
  } else {
    log(`[DeleteOutdated] no outdated buffer since ${new Date(maxDeleteTimestamp).toISOString()}`)
  }
}

const doDeleteFile = async (bucketService, { keyFile }, log) => {
  await bucketService.deleteBuffer(keyFile)
  log(`[DeleteFile] deleted '${keyFile}'`)
}

export {
  doDeleteOutdated,
  doDeleteFile
}
