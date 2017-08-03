const nodeModulePath = require('path')
const config = require('./common.conf')

module.exports = Object.assign(config, {
  entry: { 'packager': './source/index' },
  output: {
    path: nodeModulePath.join(__dirname, '../example/'),
    filename: '[name].js'
  }
})
