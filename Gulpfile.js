'use strict';

var gulp = require('gulp');
var gulpCopy = require('gulp-copy');
var replace = require('gulp-string-replace');

var repo_root = __dirname + '/';

gulp.task('copy', function(){
  return gulp.src(['js/*', 'extern/*', 'manifest.json', 'icons/*'])
        .pipe(gulpCopy('./build/'));
});

gulp.task('build', ['copy'], function(){
    return gulp.src(['build/**/*.js', 'build/manifest.json'])
        .pipe(replace(/\{\{ crm_location \}\}/g, process.env.CRM_LOCATION))
        .pipe(gulp.dest('build/'));
});

gulp.task('watch', ['build'], function(){
  gulp.watch('./js/*', ['build']);
});
