const makePathsRelative = require('webpack/lib/util/identifier').makePathsRelative
const ExternalModuleFactoryPlugin = require('webpack/lib/ExternalModuleFactoryPlugin')
const RedevelopmentDelegatedModuleFactoryPlugin = require('./RedevelopmentDelegatedModuleFactoryPlugin')

const DelegatedSourceDependency = require('webpack/lib/dependencies/DelegatedSourceDependency')
const DelegatedExportsDependency = require('webpack/lib/dependencies/DelegatedExportsDependency')
const NullFactory = require('webpack/lib/NullFactory')
const RedevelopmentExportExpressionDependency = require('./dependencies/RedevelopmentExportExpressionDependency')

class RedevelopmentReferencePlugin {
  constructor (options) {
    this.options = options
  }

  apply (compiler) {
    const addParserPlugins = (parser, parserOptions) => {
      parser.hooks.exportExpression.tap('RedevelopmentReferencePlugin', (statement, expr) => {
        const comments = parser.getComments([statement.range[0], expr.range[0]])
        const dep = new RedevelopmentExportExpressionDependency(
          parser.state.module,
          expr.range,
          statement.range,
          comments
            .map(c => {
              switch (c.type) {
                case 'Block':
                  return `/*${c.value}*/`
                case 'Line':
                  return `//${c.value}\n`
              }
              return ''
            })
            .join('')
        )
        dep.loc = Object.create(statement.loc)
        dep.loc.index = -1
        parser.state.current.addDependency(dep)
        return true
      })
    }

    compiler.hooks.beforeCompile.tapAsync('RedevelopmentReferencePlugin', (params, callback) => {
      // 7
      const options = this.options
      if ('manifest' in options) {
        const manifest = options.manifest
        if (typeof manifest === 'string') {
          // params.compilationDependencies.add(manifest) // TODO: 加到这儿是不是合适？
          compiler.inputFileSystem.readFile(manifest, (err, result) => {
            if (err) {
              return callback(err)
            }
            try {
              params['redevelopment reference'] = JSON.parse(result.toString('utf-8'))
            } catch (e) {
              const manifestPath = makePathsRelative(compiler.options.context, manifest)
              params['redevelopment reference parse error ' + manifest] = new RedevelopmentManifestError(manifestPath, e.message)
            }
            return callback()
          })
          return
        } else {
          params['redevelopment reference'] = manifest
          return callback()
        }
      }
      return callback()
    })

    compiler.hooks.compile.tap('RedevelopmentReferencePlugin', params => {
      // 8
      let name = this.options.name
      let sourceType = this.options.sourceType
      let content = 'content' in this.options ? this.options.content : undefined
      if ('manifest' in this.options) {
        let manifestParameter = this.options.manifest
        let manifest
        if (typeof manifestParameter === 'string') {
          // If there was an error parsing the manifest
          // file, exit now because the error will be added
          // as a compilation error in the "compilation" hook.
          if (params['redevelopment reference parse error ' + manifestParameter]) {
            return
          }
          manifest = params['redevelopment reference']
        } else {
          manifest = manifestParameter
        }
        if (manifest) {
          if (!name) name = manifest.name
          if (!sourceType) sourceType = manifest.type
          if (!content) content = manifest.content
        }
      }
      const externals = {}
      const source = 'zving ' + name
      externals[source] = name
      const normalModuleFactory = params.normalModuleFactory
      new ExternalModuleFactoryPlugin(sourceType || 'var', externals).apply(normalModuleFactory)
      new RedevelopmentDelegatedModuleFactoryPlugin({
        compiler,
        source: source,
        type: this.options.type,
        scope: this.options.scope,
        context: this.options.context || compiler.options.context,
        content,
        extensions: this.options.extensions
      }).apply(normalModuleFactory)
    })

    compiler.hooks.compilation.tap('RedevelopmentReferencePlugin', (compilation, { normalModuleFactory }) => {
      // 下面relevantModules 相关的实现改写自 webpack\lib\optimize\ConcatenatedModule.js
      // 简单测试可用，但不是基于对webpack的完全理解写的，有问题也未可知
      const relevantModules = []
      compilation.hooks.optimizeChunkModules.tap('RedevelopmentReferencePlugin', (chunks, modules) => {
        for (const module of modules) {
          relevantModules.push(module)
        }
        relevantModules.sort((a, b) => {
          return a.depth - b.depth
        })
      })

      normalModuleFactory.hooks.parser.for('javascript/auto').tap('RedevelopmentReferencePlugin', addParserPlugins)

      compilation.dependencyFactories.set(DelegatedSourceDependency, normalModuleFactory)
      compilation.dependencyFactories.set(DelegatedExportsDependency, new NullFactory())
      compilation.dependencyFactories.set(RedevelopmentExportExpressionDependency, new NullFactory())
      // 这时候 compilation.modules 数组还是空的
      compilation.dependencyTemplates.set(RedevelopmentExportExpressionDependency, new RedevelopmentExportExpressionDependency.Template(relevantModules))
    })

    compiler.hooks.compilation.tap('RedevelopmentReferencePlugin', (compilation, params) => {
      // 10
      // console.log(compilation.chunks)
      if ('manifest' in this.options) {
        let manifest = this.options.manifest
        if (typeof manifest === 'string') {
          // If there was an error parsing the manifest file, add the
          // error as a compilation error to make the compilation fail.
          let e = params['redevelopment reference parse error ' + manifest]
          if (e) {
            compilation.errors.push(e)
          }
        }
      }
    })
  }
}

class RedevelopmentManifestError extends Error {
  constructor (filename, message) {
    super(message)

    this.name = 'RedevelopmentManifestError'
    this.message = `Redevelopment manifest ${filename}\n${message}`

    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = RedevelopmentReferencePlugin
