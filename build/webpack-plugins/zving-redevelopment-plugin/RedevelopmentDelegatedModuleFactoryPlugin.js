/*
  当前模块中引用其他模块，先看本地工程中是否存在模块文件，如果本地工程中不存在再去从 redevelopment-manifest.json 里代理引用
*/
'use strict'

const DelegatedModule = require('webpack/lib/DelegatedModule')
const path = require('path')

class RedevelopmentDelegatedModuleFactoryPlugin {
  constructor (options) {
    this.options = options
    options.type = options.type || 'require'
    options.extensions = options.extensions || ['', '.wasm', '.mjs', '.js', '.json']

    this.compiler = options.compiler
    this.pathCache = {}
    this.fsOperations = 0
    this.primed = false
  }

  apply (normalModuleFactory) {
    const scope = this.options.scope

    if (scope) {
      // TODO: 这一段的逻辑目前没什么用，是否删除？
      normalModuleFactory.hooks.factory.tap('RedevelopmentDelegatedModuleFactoryPlugin', factory => (data, callback) => {
        const dependency = data.dependencies[0]
        const request = dependency.request
        if (request && request.indexOf(scope + '/') === 0) {
          const innerRequest = '.' + request.substr(scope.length)
          let resolved
          if (innerRequest in this.options.content) {
            resolved = this.options.content[innerRequest]
            return callback(null, new DelegatedModule(this.options.source, resolved, this.options.type, innerRequest, request))
          }
          for (let i = 0; i < this.options.extensions.length; i++) {
            const extension = this.options.extensions[i]
            const requestPlusExt = innerRequest + extension
            if (requestPlusExt in this.options.content) {
              resolved = this.options.content[requestPlusExt]
              return callback(
                null,
                new DelegatedModule(this.options.source, resolved, this.options.type, requestPlusExt, request + extension)
              )
            }
          }
        }
        return factory(data, callback)
      })
    } else {
      // 如果二次开发工程中已经有这个模块了，则不用使用代理模块代理到原模块
      normalModuleFactory.hooks.factory.tap('RedevelopmentDelegatedModuleFactoryPlugin', factory => (data, callback) => {
        const dependency = data.dependencies[0]
        const originModule = dependency.originModule
        const request = dependency.request
        const options = this.options
        // console.log(normalModuleFactory.context)
        let innerRequest = request
        let moduleFile
        if (innerRequest && !innerRequest.match(/-?!\.\./) && data.context && originModule) {
          const alias = this.compiler.options.resolve.alias
          if (alias) {
            for (let name in alias) {
              if (innerRequest.startsWith(name + '/')) {
                innerRequest = alias[name] + innerRequest.substr(name.length)
                break
              }
            }
          }
          moduleFile = path.resolve(data.context, innerRequest.split('?')[0])
          if (moduleFile) {
            innerRequest = './' + path.relative(normalModuleFactory.context, moduleFile).replace(/\\/g, '/')
          } else {
            throw new Error(moduleFile)
          }
          const dir = path.dirname(moduleFile)
          const basename = path.basename(moduleFile)
          const fs = this.compiler.inputFileSystem
          let fileNames
          if (Object.prototype.hasOwnProperty.call(this.pathCache, dir)) {
            fileNames = this.pathCache[dir]
          } else {
            try {
              fileNames = fs.readdirSync(dir)
            } catch (e) {
              console.log(`二次开发工程中不存在目录 ${dir}，所以会引用原工程对应目录`)
            }
          }
          if (fileNames && fileNames.length) {
            this.pathCache[dir] = fileNames
            if (fileNames.indexOf(basename) !== -1) {
              if (!innerRequest.startsWith('./node_modules/') && innerRequest in options.content) {
                normalModuleFactory.hooks.module.tap('RedevelopmentDelegatedModuleFactoryPlugin', (module, data) => {
                  // 5 module.id == null  data.parser
                  if (module.userRequest && module.userRequest.replace(/\\/g, '/').endsWith(innerRequest.slice(1))) {
                    const id = options.content[innerRequest].id
                    const globalVar = options.source.split(' ')[1]
                    if (id && globalVar){
                      module.__webpack_redevelopment__ = `${globalVar}.c["${id}"] = `
                      // 形如 reference_for_redevelopment.c["1YCx"] =
                    } else {
                      throw new Error(`从 redevelopment-manifest.json 获取不到模块 ${innerRequest} 的id`)
                    }
                  }
                })
              }
              return factory(data, callback)
            }
          }
        }

        if (innerRequest in options.content) {
          const resolved = options.content[innerRequest]
          return callback(null, new DelegatedModule(options.source, resolved, options.type, dependency.userRequest, innerRequest))
        }
        return factory(data, callback)
      })
    }
  }
}
module.exports = RedevelopmentDelegatedModuleFactoryPlugin
