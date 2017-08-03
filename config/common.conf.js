const nodeModulePath = require('path')
const webpack = require('webpack')
const { DefinePlugin, BannerPlugin, optimize: { ModuleConcatenationPlugin } } = webpack

const { NODE_ENV = 'production' } = process.env
const IS_PRODUCTION = NODE_ENV === 'production'

module.exports = {
  target: 'node',
  node: false, // stop webpack's (crippled) internal NodeStuffPlugin
  resolve: {
    alias: { source: nodeModulePath.resolve(__dirname, '../source') }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [ { loader: 'babel-loader', options: { presets: [ 'stage-0' ] } } ]
      }
    ]
  },
  plugins: [].concat(
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
      '__DEV__': !IS_PRODUCTION
    }),
    IS_PRODUCTION ? [
      new ModuleConcatenationPlugin(),
      new BannerPlugin({ banner: '/* eslint-disable */', raw: true, test: /\.js$/, entryOnly: false })
    ] : []
  )
}
