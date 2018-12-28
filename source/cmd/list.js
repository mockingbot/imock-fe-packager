import { binary, padTable } from 'dr-js/module/common/format'
import { indentLine } from 'dr-js/module/common/string'

const doList = async (bucketService, { listKeyPrefix = '' }, log) => {
  const { bufferList } = await bucketService.getBufferList(listKeyPrefix)
  bufferList.forEach((v) => (v.lastModifiedDate = new Date(v.lastModified)))
  bufferList.sort((a, b) => (b.lastModifiedDate - a.lastModifiedDate)) // bigger time first
  log(`[List] listKeyPrefix '${listKeyPrefix}'\n${indentLine(padTable({
    table: [
      [ 'LastModifiedDate', 'Size', 'Key', 'ETag' ],
      ...bufferList.map(({ lastModifiedDate, size, key, eTag }) => [
        lastModifiedDate.toISOString(), `${binary(size)}B`, key, eTag
      ])
    ],
    padFuncList: [ 'L', 'R', 'L', 'L' ]
  }), '  ')}\n`)
}

export { doList }
