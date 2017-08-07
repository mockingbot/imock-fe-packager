import nodeModuleFs from 'fs'
import { promisify } from 'util'

const unlink = promisify(nodeModuleFs.unlink)
const readFile = promisify(nodeModuleFs.readFile)
const writeFile = promisify(nodeModuleFs.writeFile)

export {
  unlink,
  readFile,
  writeFile
}
