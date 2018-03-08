/**
 * 文件说明:
 * 详细描述:
 * 创建者: 余成龍
 * 创建时间: 2016/5/27
 * 变更记录:
 */
// 载入外挂
var gulp = require('gulp'),
  less = require('gulp-less'),
  autoprefixer = require('gulp-autoprefixer'),
  minifycss = require('gulp-minify-css'),
  jshint = require('gulp-jshint'),
  uglify = require('gulp-uglify'),
  imagemin = require('gulp-imagemin'),
  rename = require('gulp-rename'),
  clean = require('gulp-clean'),
  concat = require('gulp-concat'),
  notify = require('gulp-notify'),
  cache = require('gulp-cache'),
  gls = require('gulp-live-server'),
  browserSync = require('browser-sync').create(),
  SSI = require('browsersync-ssi'),
  plumber = require('gulp-plumber'),
  stripDebug = require('gulp-strip-debug'),
  livereload = require('gulp-livereload');

// 样式
gulp.task('styles', function() {
  return gulp.src('h5/style/pod.less')
    .pipe(less({ style: 'expanded', }))
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulp.dest('h5dist/style'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(minifycss())
    .pipe(gulp.dest('h5dist/style'))
    .pipe(notify({ message: 'Styles task complete' }));
});

// 脚本
gulp.task('scripts', function() {
  return gulp.src(['h5/javascript/pod.js'])
    .pipe(jshint.reporter('default'))
    .pipe(concat('pod.js'))
    .pipe(gulp.dest('h5dist/javascript'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(uglify())
    .pipe(stripDebug())
    .pipe(gulp.dest('h5dist/javascript'))
    .pipe(notify({ message: 'Scripts task complete' }));
});

// 图片
gulp.task('images', function() {
  return gulp.src('h5/images/*')
    .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(gulp.dest('h5dist/images'))
    .pipe(notify({ message: 'Images task complete' }));
});

// 清理
gulp.task('clean', function() {
  return gulp.src(['h5dist/'], {read: false})
    .pipe(clean());
});



gulp.task('html', function() {

  return gulp.src("h5/*.html")
    .pipe(plumber())
    .pipe(gulp.dest("h5dist/"))
    .pipe(browserSync.stream());
});



gulp.task('serve', function() {

  browserSync.init({
    server: {
      baseDir:["./h5dist"],
      middleware:SSI({
        baseDir:'./h5dist',
        ext:'.shtml',
        version:'2.10.0'
      })
    }
  });

  gulp.watch("h5/css/*.less", ['styles']).on("change",browserSync.reload);
  gulp.watch("h5/javascript/*.js", ['scripts']).on("change",browserSync.reload);
  gulp.watch("h5/*.html", ['html']).on("change",browserSync.reload);
});


// 预设任务
gulp.task('default', ['clean','serve'], function() {
  gulp.start('styles', 'scripts', 'images', 'html');
});
