'use strict';

const gulp = require('gulp');
const gulpCopy = require('gulp-copy');
const replace = require('gulp-string-replace');
const exec = require('child_process').exec;
const zip = require('gulp-zip');
const fs = require('fs');

const repo_root = __dirname + '/';

gulp.task('copyjquery', function(){
    gulp.src('node_modules/jquery/dist/jquery.min.js')
        .pipe(gulp.dest('build/extern/')) 
});

gulp.task('copy', ['copyjquery'], function(){
  return gulp.src(['js/*', 'extern/*', 'manifest.json', 'icons/*', 'assets/*'])
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
    let raw_creds = fs.readFileSync(process.env.KEY_LOCATION).toString();
    let creds = raw_creds.replace(/\"/g, '\\"').replace(/\n/g, '\\n');
    return gulp.src(['build/**/*.js', 'build/manifest.json'])
        .pipe(replace(/\{\{ crm_location \}\}/g, process.env.CRM_LOCATION))
        .pipe(replace(/{{ credentials }}/g, raw_creds))
        .pipe(replace(/{ credentials }/g, creds))
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
