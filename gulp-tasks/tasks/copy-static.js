'use strict';

var gulp    = require('gulp');
var handleErrors = require('../util/handle-errors');

gulp.task('copy-static', function() {
  // Copy Vendor JavaScript
  gulp.src([
    'node_modules/react/dist/react.min.js',
    'node_modules/jquery/dist/jquery.min.js',
    'node_modules/raphael/raphael-min.js'
  ])
    .pipe(gulp.dest('lib/assets/scripts/vendor'))
    .on('error', handleErrors);

  // Copy Vendor CSS
  gulp.src(['node_modules/bootstrap/dist/css/bootstrap.min.css'])
    .pipe(gulp.dest('lib/assets/css/vendor'))
    .on('error', handleErrors);
});
