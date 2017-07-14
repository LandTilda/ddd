var gulp = require('gulp'),
	fileinclude = require('gulp-file-include'),
	autoprefixer = require('gulp-autoprefixer'),
	livereload = require('gulp-livereload'),
    minifyCSS = require('gulp-minify-css'),
    connect = require('gulp-connect'),
    rev_append = require('gulp-rev-append'),
    sourcemaps = require('gulp-sourcemaps'),
    sass = require('gulp-sass'),
    uglify = require('gulp-uglify');


// server connect
gulp.task('connect', function() {
  connect.server({
    root: 'app',
    livereload: true
  });
});

// css
gulp.task('css', function () {
  return gulp.src('scss/style.scss')
  	.pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
        browsers: ['last 100 versions','ie > 8', 'opera > 12.1', 'Safari > 5', 'ff > 5']
    }))﻿
    .pipe(minifyCSS())
    .pipe(sourcemaps.write('maps/'))
    .pipe(gulp.dest('app/css/'))
    .pipe(connect.reload());
});

// js
gulp.task('js', function () {
  gulp.src('lib/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('app/js/'))
    .pipe(connect.reload());
});

// include HTML
gulp.task('fileinclude', function() {
  gulp.src(['html/*.html'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest('app/'))
    .pipe(connect.reload());
  gulp.src(['html/portfolio/*.html'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest('app/portfolio/'))
    .pipe(connect.reload());
});

// html
gulp.task('html', function () {
  gulp.src('app/*.html')
    .pipe(rev_append())
    .pipe(gulp.dest('app/'))
  	.pipe(connect.reload());
});

// watcher
gulp.task('watch', function () {
	gulp.watch('scss/*.scss', ['css'])
    gulp.watch('html/*.html', ['fileinclude'])
    gulp.watch('html/**/*.html', ['fileinclude'])
	gulp.watch('lib/*.js', ['js'])
});


// deafault
gulp.task('default', ['connect', 'css', 'fileinclude', 'html', 'js', 'watch']);
