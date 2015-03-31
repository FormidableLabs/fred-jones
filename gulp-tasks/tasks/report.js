'use strict';

var gulp = require('gulp');
var shell = require('gulp-shell')

gulp.task('report', ['test:clean'], shell.task([
  './bin/plato -d reports -f "./lib/**/*" -x "./lib/client/assets/scripts/vendor/*, ./lib/client/components/d3-graphs/**/*"'
]));
