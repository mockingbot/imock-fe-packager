import { binary as formatBinary, stringIndentLine, padTable } from 'dr-js/module/common/format'

const doList = async (bucketService, { listKeyPrefix = '' }) => {
  const { bufferList } = await bucketService.getBufferList(listKeyPrefix)
  bufferList.forEach((v) => (v.lastModifiedDate = new Date(v.lastModified)))
  bufferList.sort((a, b) => (b.lastModifiedDate - a.lastModifiedDate)) // bigger time first
  console.log(`[List] listKeyPrefix '${listKeyPrefix}'\n${stringIndentLine(padTable({
    table: [
      [ 'LastModifiedDate', 'Size', 'Key', 'ETag' ],
      ...bufferList.map(({ lastModifiedDate, size, key, eTag }) => [
        lastModifiedDate.toISOString(), `${formatBinary(size)}B`, key, eTag
      ])
    ],
    padFuncList: [ 'L', 'R', 'L', 'L' ],
    cellPad: ' | '
  }), '  ')}`)
}

export {
  doList
}
