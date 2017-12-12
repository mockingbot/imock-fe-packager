const nodeModulePath = require('path')
const webpack = require('webpack')
const BabelMinifyPlugin = require('babel-minify-webpack-plugin')
const { HashedModuleIdsPlugin, DefinePlugin, BannerPlugin, optimize: { ModuleConcatenationPlugin } } = webpack

const NODE_ENV = process.env.NODE_ENV
const IS_PRODUCTION = NODE_ENV === 'production'

const BABEL_OPTIONS = {
  babelrc: false,
  presets: [ [ 'env', { targets: { node: 8 }, modules: false } ] ],
  plugins: [ [ 'transform-class-properties' ], [ 'transform-object-rest-spread', { useBuiltIns: true } ] ]
}

module.exports = {
  target: 'node', // support node main modules like 'fs'
  node: false, // stop webpack's (crippled) internal NodeStuffPlugin
  output: {
    path: nodeModulePath.join(__dirname, './library/'),
    filename: '[name].js'
  },
  entry: { 'index': 'source/index' },
  resolve: { alias: { source: nodeModulePath.resolve(__dirname, './source/') } },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, use: { loader: 'babel-loader', options: BABEL_OPTIONS } }
    ]
  },
  plugins: [
    new DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify(NODE_ENV), '__DEV__': !IS_PRODUCTION }),
    new HashedModuleIdsPlugin(),
    ...(IS_PRODUCTION ? [
      new ModuleConcatenationPlugin(),
      new BabelMinifyPlugin(),
      new BannerPlugin({ banner: '/* eslint-disable */', raw: true, test: /\.js$/, entryOnly: false })
    ] : [])
  ]
}
