'use strict'
const webpackConfig = require('./webpack.prod.conf')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

webpackConfig.plugins.push(new BundleAnalyzerPlugin())

module.exports = webpackConfig
