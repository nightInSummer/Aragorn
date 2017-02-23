const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');
module.exports = {
  output: {
    path: path.join(__dirname, '../src/static'),
    filename: '[name].js',
    library: '[name]'
  },
  entry: {
    dll: [
      '@cycle/dom',
      '@cycle/isolate',
      '@cycle/run',
      '@cycle/rxjs-run',
      '@cycle/xstream-adapter',
      '@cycle/base',
      'lodash',
      'xstream',
      'rxjs'
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
          warnings: false
      }
    }),
    new webpack.DllPlugin({
      path: 'manifest.json',
      name: '[name]',
      context: __dirname
    }),
    new webpack.ProvidePlugin({
      _: 'lodash'
    }),
    new ExtractTextPlugin('[name].css')
  ]
}