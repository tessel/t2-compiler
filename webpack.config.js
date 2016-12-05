/*
 * WARNING: Tampering with how entry is populated could affect pattern matching
 */

const fs = require('fs')
const path = require('path')
const minimatch = require('minimatch')

const env = process.env.NODE_ENV || 'development'
const pattern = process.env.PATTERN || '*'

const entry = fs.readdirSync('functions')
  .filter(minimatch.filter(pattern))
  .reduce((map, funcName) => {
    map[funcName] = path.resolve(`functions/${funcName}/index`)
    return map
  }, {})

module.exports = {
  target: 'node',
  entry,
  output: {
    path: 'dist',
    filename: '[name]/index.js',
    libraryTarget: 'commonjs2'
  },
  resolve: {
    modules: [ 'node_modules', 'lib' ],
    alias: {
      'shep-config': path.resolve(`config/${env}.js`)
    }
  },
  externals: {
    'aws-sdk': 'aws-sdk'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'source-map-loader'
      },
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: /node_modules/
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      }
    ]
  },
  devtool: 'source-map'
}
