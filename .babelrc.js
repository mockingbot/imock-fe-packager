const getReplaceDEV = (value) => ({ replacements: [ { identifierName: '__DEV__', replacement: { type: 'booleanLiteral', value } } ] })

module.exports = {
  env: {
    dev: { // __DEV__ = true, use require()
      presets: [ [ '@babel/env', { targets: { node: 8 } } ] ],
      plugins: [
        [ '@babel/proposal-class-properties' ],
        [ '@babel/proposal-object-rest-spread', { useBuiltIns: true } ],
        [ 'module-resolver', { root: [ './' ], alias: { 'dr-js/module/(.+)': 'dr-js/library/' } } ],
        [ 'minify-replace', getReplaceDEV(true) ]
      ]
    }
  }
}
