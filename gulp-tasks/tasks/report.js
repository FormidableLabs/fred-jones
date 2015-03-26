'use strict';

var gulp = require('gulp');
var shell = require('gulp-shell')

gulp.task('report', ['test:clean'], shell.task([
  './bin/plato -d reports lib/**'
]));
