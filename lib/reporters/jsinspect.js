'use strict';

var Inspector = require('jsinspect/lib/inspector');
var Reporter = require('jsinspect/lib/reporters');
var Promise = require('bluebird');

var options = {
  threshold:   30,
  diff:        true,
  identifiers: false,
  failOnMatch: true,
  suppress:    100,
  reporter:    'json'
};

// TODO: Get files in here
// TODO: Figure out how to redirect reporter from stdOut -> memory
// TODO: Figure out how this reporter using promises will interact
var inspect = function() {
  var files = ['./lib/cli.js'];

  return new Promise(function(resolve, reject) {
    var inspector = new Inspector(files, {
      threshold:   options.threshold,
      diff:        options.diff,
      identifiers: options.identifiers
    });

    var reporter = new Reporter[options.reporter](inspector, {
      diff: options.diff,
      suppress: options.suppress
    });

    if (options.failOnMatch) {
      inspector.on('match', function() {
        reject();
      });
    }

    inspector.on('end', function() {
      resolve();
    });

    inspector.run();
  })
};

module.exports = inspect;
