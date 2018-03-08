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
    return gulp.src('app/css/base.less')
        .pipe(less({ style: 'expanded', }))
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(gulp.dest('dist/css'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(minifycss())
        .pipe(gulp.dest('dist/css'))
        .pipe(notify({ message: 'Styles task complete' }));
});

// 脚本
gulp.task('scripts', function() {
    return gulp.src(['app/javascript/jquery.js','app/javascript/ion.rangeSlider.js','app/javascript/main.js','app/javascript/jquery.lazyload.min.js'])
        .pipe(jshint.reporter('default'))
        .pipe(concat('main.js'))
        .pipe(gulp.dest('dist/javascript'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(uglify())
        .pipe(stripDebug())
        .pipe(gulp.dest('dist/javascript'))
        .pipe(notify({ message: 'Scripts task complete' }));
});

// 图片
gulp.task('images', function() {
    return gulp.src('app/images/*')
        .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
        .pipe(gulp.dest('dist/images'))
        .pipe(notify({ message: 'Images task complete' }));
});

// 清理
gulp.task('clean', function() {
    return gulp.src(['dist/'], {read: false})
        .pipe(clean());
});



gulp.task('html', function() {

    return gulp.src("app/*.html")
        .pipe(plumber())
        .pipe(gulp.dest("dist/"))
        .pipe(browserSync.stream());
});



gulp.task('serve', function() {

    browserSync.init({
        server: {
            baseDir:["./dist"],
            middleware:SSI({
                baseDir:'./dist',
                ext:'.shtml',
                version:'2.10.0'
            })
        }
    });

    gulp.watch("app/css/*.less", ['styles']).on("change",browserSync.reload);
    gulp.watch("app/javascript/*.js", ['scripts']).on("change",browserSync.reload);
    gulp.watch("app/*.html", ['html']).on("change",browserSync.reload);
});


// 预设任务
gulp.task('default', ['clean','serve'], function() {
    gulp.start('styles', 'scripts', 'images', 'html');
});
