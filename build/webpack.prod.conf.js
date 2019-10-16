'use strict'
const baseWebpackConfig = require('./webpack.base.conf')
const path = require('path')
const webpack = require('webpack')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const merge = require('webpack-merge')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
// const HtmlWebpackPlugin = require('html-webpack-plugin')
// const ExtractTextPlugin = require('extract-text-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const RedevelopmentReferencePlugin = require('./webpack-plugins/zving-redevelopment-plugin/RedevelopmentReferencePlugin')

const faster = process.env.MODE ? process.env.MODE.trim() === 'faster' : false
const output = process.env.OUTPUT ? process.env.OUTPUT.trim() : resolve('dist')

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

const webpackConfig = merge(baseWebpackConfig, {
  mode: 'production',
  devtool: false,
  output: {
    path: output
  },
  optimization: {
  },
  plugins: [
    new CaseSensitivePathsPlugin(),
    new VueLoaderPlugin(),
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    // extract css into its own file
    // new ExtractTextPlugin({
    //   filename: 'assets/css/[name].[chunkhash:6].css',
    //   allChunks: true
    // }),
    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/ampedandwired/html-webpack-plugin
    // new HtmlWebpackPlugin({
    //   template: path.resolve(__dirname, '../src/index.html'),
    //   filename: path.resolve(__dirname, '../dist/index.html'),
    //   chunks: ['app'],
    //   inject: true
    // }),
    // keep module.id stable when vendor modules does not change
    new webpack.HashedModuleIdsPlugin(),
    // new webpack.DllReferencePlugin({
    //   manifest: require('../static/dll-manifest.json')
    // }),
    new RedevelopmentReferencePlugin({
      manifest: require('../static/redevelopment-manifest.json')
    }),

    // enable scope hoisting 下面这个千万不要使用，否则会让一些本应该成为独立模块的变成了其他模块一的部分
    // new webpack.optimize.ModuleConcatenationPlugin(),
    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: '',
        ignore: ['*.psd']
      }, {
        from: path.resolve(__dirname, '../public'),
        to: '',
        force: true,
        ignore: ['*.psd']
      }, {
        from: path.resolve(__dirname, '../src/*.html'),
        to: '',
        flatten: true,
        transform: function (content, path) {
          return content.toString().replace(/__replace_by_time__/g, ~~(Date.now() / 10000))
        }
      }
    ])
  ]
})
webpackConfig.optimization = webpackConfig.optimization || {}
if (faster) {
  webpackConfig.optimization.minimizer = []
  webpackConfig.plugins.pop()
  webpackConfig.plugins.push(new CopyWebpackPlugin([
    {
      from: path.resolve(__dirname, '../src/*.html'),
      to: '',
      flatten: true,
      transform: function (content, path) {
        return content.toString().replace(/__replace_by_time__/g, ~~(Date.now() / 10000))
      }
    }
  ]))
} else {
  webpackConfig.optimization.minimizer = [
    new UglifyJsPlugin({
      uglifyOptions: {
        compress: {
          warnings: false
        }
      },
      sourceMap: true,
      parallel: true
    })
  ]
  webpackConfig.plugins.unshift(new CleanWebpackPlugin([output], {
    allowExternal: true,
    exclude: ['zcms.dll.js']
  }))
}

module.exports = webpackConfig
