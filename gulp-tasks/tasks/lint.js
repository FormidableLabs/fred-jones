'use strict';

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var handleErrors = require('../util/handle-errors');

var lintableSource = [
  'Gruntfile.js',
  'lib/**/*.js',
  '!lib/assets/**/*.js',
  'test/**/*.js',
  '!test/fixtures/**/*.js',
  'lib/assets/scripts/*.js'
];

gulp.task('jshint', function() {
  return gulp.src(lintableSource)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
    .on('error', handleErrors);
});

gulp.task('lint', ['jshint']);
