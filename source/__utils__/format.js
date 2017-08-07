const formatSize = (octetCount) => octetCount < 1024 * 1.5 ? `${octetCount}B`
  : octetCount < 1024 * 1024 * 1.5 ? `${(octetCount / 1024).toFixed(2)}KB`
    : `${(octetCount / 1024 / 1024).toFixed(2)}MB`
const stringIndentLine = (string, indentString = '  ') => `${indentString}${string.split('\n').join(`\n${indentString}`)}`
const stringListJoinCamelCase = (stringList, fromIndex = 1) => stringList.reduce((o, string, index) => index >= fromIndex ? o + string[ 0 ].toUpperCase() + string.slice(1) : o + string, '')

export {
  formatSize,
  stringIndentLine,
  stringListJoinCamelCase
}
