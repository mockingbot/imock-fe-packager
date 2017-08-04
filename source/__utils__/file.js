import nodeModuleFs from 'fs'
import { promisify } from 'util'

const unlink = promisify(nodeModuleFs.unlink)
const readFile = promisify(nodeModuleFs.readFile)
const writeFile = promisify(nodeModuleFs.writeFile)
const formatSize = (octetCount) => octetCount < 1024 * 1.5 ? `${octetCount}B`
  : octetCount < 1024 * 1024 * 1.5 ? `${(octetCount / 1024).toFixed(2)}KB`
    : `${(octetCount / 1024 / 1024).toFixed(2)}MB`

export {
  unlink,
  readFile,
  writeFile,
  formatSize
}
