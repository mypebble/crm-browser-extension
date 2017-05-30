'use strict';

const gulp = require('gulp');
const gulpCopy = require('gulp-copy');
const replace = require('gulp-string-replace');
const exec = require('child_process').exec;
const zip = require('gulp-zip');

const repo_root = __dirname + '/';

gulp.task('copy', function(){
  return gulp.src(['js/*', 'extern/*', 'manifest.json', 'icons/*'])
        .pipe(gulpCopy('./build/'));
});

gulp.task('webpack', function(cb){
    exec('webpack', function(err, stdout, stderr){
        console.log(stdout);
        console.log(stderr);
        cb(err);
    })
});

gulp.task('build', ['copy', 'webpack'], function(){
    return gulp.src(['build/**/*.js', 'build/manifest.json'])
        .pipe(replace(/\{\{ crm_location \}\}/g, process.env.CRM_LOCATION))
        .pipe(gulp.dest('build/'));
});

gulp.task('watch', ['build'], function(){
    gulp.watch('./js/*', ['build']);
});

gulp.task('zip', ['build'], function(){
    return gulp.src('build/**/*')
        .pipe(zip('extension.zip'))
        .pipe(gulp.dest('dist'));
});
