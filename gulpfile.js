/*
单页应用js构建任务
改动根目录下的js，则编译被改动的js
改动非根目录下js,vue，都只编译根目录下的app.js
 */
const gulp = require('gulp')
const replace = require('gulp-replace')
const express = require('express')
const proxy = require('http-proxy-middleware')
const config = require('./config/index.js')

let dist = './dist/'
let staticDir = './static/'
const srcFiles = {
  htmlInRoot: './src/*.html'
}
gulp.task('webserver', function () {
  const app = express();
  if(config.dev.proxyTable && config.dev.proxyTable.length){
    config.dev.proxyTable.forEach(cfg=>{
      if(cfg.context && cfg.context.length){
        app.use(proxy(cfg.context, {
          target: cfg.target,
          changeOrigin: cfg.changeOrigin
        }))
      }else{
        app.use(proxy(cfg))
      }
    })
  }
  app.get('*', express.static(dist))
  app.get('*', express.static(staticDir))
  app.listen(config.dev.port, function () {
    console.log(`Your application is running here: http://localhost:${config.dev.port}`);
  });
})

gulp.task('buildHtml', function () {
  return gulp.src([srcFiles.htmlInRoot], { base: './src' })
    .pipe(replace(/__replace_by_time__/g, ~~(Date.now()/10000)))
    .pipe(gulp.dest(dist))
})
