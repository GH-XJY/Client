'use strict'
const HarmonyExportExpressionDependency = require('webpack/lib/dependencies/HarmonyExportExpressionDependency')

class RedevelopmentExportExpressionDependency extends HarmonyExportExpressionDependency {
  constructor (originModule, range, rangeStatement, prefix) {
    super()
    this.originModule = originModule
    this.range = range
    this.rangeStatement = rangeStatement
    this.prefix = prefix
  }

  get type () {
    return 'redevelopment export expression'
  }

  getExports () {
    return {
      exports: ['default'],
      dependencies: undefined
    }
  }
}

RedevelopmentExportExpressionDependency.Template = class RedevelopmentExportDependencyTemplate {
  constructor (relevantModules) {
    this.relevantModules = relevantModules
  }

  apply (dep, source) {
    const updateInstalledModules = dep.originModule.__webpack_redevelopment__ || ''
    let content = `/* harmony default export */ var __WEBPACK_MODULE_DEFAULT_EXPORT__ = ${updateInstalledModules}`
    // 下面relevantModules 相关的实现改写自 webpack\lib\optimize\ConcatenatedModule.js
    // 简单测试可用，但不是基于对webpack的完全理解写的，有问题也未可知
    if (this.relevantModules.includes(dep.originModule)) {
      const used = dep.originModule.isUsed('default')
      const exportsName = dep.originModule.exportsArgument
      // 经测试，原工程已经存在的.vue，二次开发再改了.vue，就不要再加 `__webpack_exports__["a"] =` 但 `__webpack_exports__["default"] =` 要加
      if (used && !(updateInstalledModules && used !== 'default')){
        content += `${exportsName}[${JSON.stringify(used)}] = `
      }
    }

    if (dep.range) {
      source.replace(dep.rangeStatement[0], dep.range[0] - 1, content + '(' + dep.prefix)
      source.replace(dep.range[1], dep.rangeStatement[1] - 1, ');')
      // 生成的代码形如 var face = reference_for_redevelopment.c["1YCx"] = (component.exports);
      // 对延迟加载的有效，但还是没有直接替换掉已经被引用的，需要配合babel中的实现替换掉子属性
      return
    }

    source.replace(dep.rangeStatement[0], dep.rangeStatement[1] - 1, content + dep.prefix)
  }
}

module.exports = RedevelopmentExportExpressionDependency
