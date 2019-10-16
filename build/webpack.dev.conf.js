'use strict'
const baseWebpackConfig = require('./webpack.base.conf')
const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
// const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const RedevelopmentReferencePlugin = require('./webpack-plugins/zving-redevelopment-plugin/RedevelopmentReferencePlugin')

const portfinder = require('portfinder')

const packageConfig = require('../package.json')
const config = require('../config/index.js')

const HOST = process.env.HOST
const PORT = process.env.PORT && Number(process.env.PORT)

const devWebpackConfig = merge(baseWebpackConfig, {
  mode: 'development',
  // cheap-module-eval-source-map is faster for development
  devtool: 'cheap-source-map',
  watch: true,
  devServer: {
    // disableHostCheck: true,
    clientLogLevel: 'warning',
    hot: true,
    contentBase: [path.join(__dirname, '../public'), path.join(__dirname, '../static')], // since we use CopyWebpackPlugin.
    watchContentBase: true,
    compress: true,
    host: HOST || '0.0.0.0',
    port: PORT || config.dev.port,
    open: config.dev.autoOpenBrowser,
    overlay: { warnings: false, errors: true },
    // publicPath: `/${SERVICEID}/`,
    proxy: config.dev.proxyTable,
    quiet: true, // necessary for FriendlyErrorsPlugin
    watchOptions: {
      poll: false
    },
    stats: {
      modules: false
    }
  },
  plugins: [
    new CaseSensitivePathsPlugin(),
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
    new webpack.NoEmitOnErrorsPlugin(),
    // new webpack.DllReferencePlugin({
    //   manifest: require('../static/dll-manifest.json')
    // }),
    new RedevelopmentReferencePlugin({
      manifest: path.join(__dirname, '../static/redevelopment-manifest.json')
    }),
    // see https://github.com/ampedandwired/html-webpack-plugin
    // new HtmlWebpackPlugin({
    //   template: path.resolve(__dirname, '../src/index.html'),
    //   filename: path.resolve(__dirname, '../dist/index.html'),
    //   chunks: ['app'],
    //   inject: true
    // }),
    // copy custom static assets
    new CopyWebpackPlugin([
      {
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

const createNotifierCallback = () => {
  const notifier = require('node-notifier')

  return (severity, errors) => {
    if (severity !== 'error') return

    const error = errors[0]
    const filename = error.file && error.file.split('!').pop()

    notifier.notify({
      title: packageConfig.name,
      message: severity + ': ' + error.name,
      subtitle: filename || '',
      icon: path.join(__dirname, 'logo.png')
    })
  }
}

module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = process.env.PORT || 3000
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      // publish the new Port, necessary for e2e tests
      process.env.PORT = port
      // add port to devServer config
      devWebpackConfig.devServer.port = port

      // Add FriendlyErrorsPlugin
      devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
        compilationSuccessInfo: {
          messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`]
        },
        onErrors: createNotifierCallback()
      }))
      console.log(`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`)
      resolve(devWebpackConfig)
    }
  })
})
