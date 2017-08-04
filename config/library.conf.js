const nodeModulePath = require('path')
const config = require('./common.conf')

module.exports = Object.assign(config, {
  bail: true, // Don't attempt to continue if there are any errors.
  entry: { 'index': './source/index' },
  output: {
    path: nodeModulePath.join(__dirname, '../library/'),
    filename: '[name].js'
  }
})
