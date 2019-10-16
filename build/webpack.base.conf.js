'use strict'
const path = require('path')
const fs = require('fs')
const eslintConfig = require('../.eslintrc.json')

const faster = process.env.MODE === 'faster'
const output = process.env.OUTPUT || resolve('dist')

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

const createLintingRule = _ => ({
  enforce: 'pre',
  test: /\.(js|vue)$/,
  exclude: resolve('node_modules'),
  include: resolve('src'),
  loader: 'eslint-loader',
  options: {
    formatter: require('eslint-friendly-formatter'),
    parserOptions: {
      parser: 'babel-eslint'
    },
    env: {
      browser: true
    },
    plugins: [],
    rules: Object.assign(eslintConfig.rules, {
      // 'comma-dangle': 'warn',
      'no-multiple-empty-lines': 'warn',
      'no-tabs': 'warn'
    })
  }
})

const createBabelOptions = () => {
  const babelrc = {
    cacheDirectory: true,
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            browsers: ['edge >= 15']
          },
          modules: false,
          useBuiltIns: false
        }
      ]
    ],
    plugins: [
      // [resolve('build/babel-plugins/babel-plugin-zving-redevelopment-reference.js'), { manifest: require('../static/redevelopment-manifest.json') }],
      resolve('build/babel-plugins/babel-plugin-zving-redevelopment-reference.js'),
      'transform-vue-jsx',
      '@babel/plugin-syntax-dynamic-import'
    ]
  }
  if (process.env.IE) {
    babelrc.presets[0][1].targets.browsers = ['ie >= ' + process.env.IE]
    babelrc.plugins = [
      // [resolve('build/babel-plugins/babel-plugin-zving-redevelopment-reference.js'), { manifest: require('../static/redevelopment-manifest.json') }],
      resolve('build/babel-plugins/babel-plugin-zving-redevelopment-reference.js'),
      'transform-vue-jsx',
      '@babel/plugin-syntax-dynamic-import',
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-proposal-object-rest-spread'
    ]
  }
  console.log(babelrc.presets[0][0], 'targets.browsers ', babelrc.presets[0][1].targets.browsers)
  return babelrc
}

const createEntryOptions = _ => {
  const entry = {}
  const files = fs.readdirSync(path.join(__dirname, '../src'))
  files.forEach(fileName => {
    if (path.extname(fileName) === '.js') {
      entry[fileName.split('.')[0]] = './src/' + fileName
    }
  })
  return entry
}
const webpackConfig = {
  context: path.resolve(__dirname, '../'),
  entry: /* {app: './src/app.js'} || */ createEntryOptions(),
  output: {
    path: output,
    filename: '[name].js',
    chunkFilename: '[name].js'
  },
  stats: {
    assets: false, // 隐藏 assets 被 emitted 的信息
    modules: false // 隐藏 modules 被 built 的信息
  },
  optimization: {
    // splitChunks: {
    //   chunks: 'all', // initial(初始块)、async(按需加载块)、all(全部块)，默认为all;
    //   // minSize: 1000, //  表示在压缩前的最小模块大小，默认为0
    //   minChunks: 2, // 最少被被多少模块引用，默认为1
    //   maxAsyncRequests: 10, // 异步加载请求不得超过多少个，默认为1
    //   maxInitialRequests: 6, // 初始加载请求不得超过多少个，默认为1
    //   name: true,
    //   cacheGroups: {
    //     commons: {
    //       name: 'common-project', // 抽取的chunk的名字，默认由块名和hash值自动生成
    //       // test: /[\\/]node_modules[\\/]/, //可以为字符串，正则表达式，函数， 只要是满足条件的module都会被抽取到该common的chunk中
    //       chunks: 'all',
    //       reuseExistingChunk: true // 如果该chunk中引用了已经被抽取的chunk，直接引用该chunk，不会重复打包代码
    //     }
    //   }
    // }
  },
  resolve: {
    modules: [resolve('node_modules')],
    extensions: ['.vue', '.js', '.json'],
    alias: {
      vue$: 'vue/dist/vue.esm.js',
      '@src': resolve('src'),
      '@static': resolve('static')
    }
  },
  resolveLoader: {
    modules: [
      resolve('build/webpack-loaders'),
      'node_modules'
    ]
  },
  externals: {
    // 库已经在页面中引入，使用全局变量代替对库的引用，库内容不用再打包到app.js中
    vue: 'Vue',
    lodash: '_',
    axios: 'axios',
    'axios-mock-adapter': 'AxiosMockAdapter',
    'vue-router': 'VueRouter',
    'element-ui': 'ELEMENT',
    'vue-i18n': 'VueI18n',
    echarts: 'echarts'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: [{
          loader: 'vue-loader'
        }, {
          loader: 'zving-redevelopment-vue-loader'
        }]
      },
      {
        test: /\.js$/,
        loader: 'babel-loader?cacheDirectory=true',
        include: [
          resolve('src'),
          resolve('node_modules/vue'),
          resolve('node_modules/element-ui'),
          resolve('node_modules/vue-photoswipe'),
          resolve('node_modules/resize-detector')
        ],
        options: createBabelOptions()
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 1024, // 1K左右
          name: 'images/[name].[ext]'
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 1024, // 1K左右
          name: 'media/[name].[ext]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 1024, // 1K左右
          name: 'fonts/[name].[ext]'
        }
      }
    ]
  },
  node: {
    // prevent webpack from injecting useless setImmediate polyfill because Vue
    // source contains it (although only uses it if it's native).
    setImmediate: false,
    // prevent webpack from injecting mocks to Node native modules
    // that does not make sense for the client
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  }
}

if (!faster) {
  webpackConfig.module.rules.unshift(createLintingRule())
}

module.exports = webpackConfig
