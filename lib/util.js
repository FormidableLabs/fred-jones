'use strict';

var fs = require('fs');
var bunyan = require('bunyan');
var path = require('path');

var log = bunyan.createLogger({
  name: 'report-card',
  level: 'warn'
});

exports.findCommonBase = function(files) {
  if (!files || files.length === 1) { return ''; }
  var lastSlash = files[0].lastIndexOf(path.sep);
  if (!lastSlash) { return ''; }
  var first = files[0].substr(0, lastSlash + 1);
  var prefixlen = first.length;
  files.forEach(function(file){
    for (var i = prefixlen; i > 0; i--) {
      if (file.substr(0,i) === first.substr(0,i)) {
        prefixlen = i;
        return;
      }
    }
    prefixlen = 0;
  });
  return first.substr(0,prefixlen);
};

exports.formatJSON = function (report) {
  return JSON.stringify(report, function(k,v){
    if (k === 'identifiers') { return ['__stripped__']; }
    return v;
  });
};

exports.readJSON = function (file, options) {
  options = options || {};

  if (options.q) { log.level('error'); }
  var result = {};
  if (fs.existsSync(file)) {
    log.debug('Parsing JSON from file %s', file);
    try {
      var src = fs.readFileSync(file);
      result = JSON.parse(src);
    } catch(e) {
      log.warning('Could not parse JSON from file %s', file);
    }
  } else {
    log.info('Not parsing missing file "%s"', file);
  }
  return result;
};
