'use strict';

var gulp = require('gulp');
var nodeunit = require('gulp-nodeunit');
var shell = require('gulp-shell')
var del = require('del');
var handleErrors = require('../util/handle-errors');

gulp.task('nodeunit', function () {
  return gulp.src('test/**/*_test.js')
    .pipe(nodeunit())
    .on('error', handleErrors);
});

gulp.task('test:clean', function() {
  del(['tmp']);
})

gulp.task('runtest', ['test:clean'], shell.task([
  './bin/plato -q -d tmp -t "test report" test/fixtures/a.js test/fixtures/b.js test/fixtures/empty.js'
]));

gulp.task('runbin', ['test:clean'], shell.task([
  './bin/plato -q -l .jshintrc -x vendor -d tmp -t "Plato report" lib/**'
]));

gulp.task('test', ['nodeunit', 'runtest', 'runbin']);
