'use strict';

var path = require('path');
var fs = require('fs-extra'); // node api with sugar
var _ = require('lodash');
var glob = require('glob');
var bunyan = require('bunyan');
var Promise = require('bluebird');
var stripJsonComments = require('strip-json-comments');

// All subsequent files required by node with the extensions .es6, .es, .jsx and .js
// will be transformed by babel.
require('babel/register');

// local lib
var util = require('./util'),
  OverviewHistory = require('./models/OverviewHistory'),
  reporters = {
    complexity : require('./reporters/complexity'),
    jshint : require('./reporters/jshint')
  };

var assets = __dirname + '/client/assets/',
  fileDir = 'files';

var log = bunyan.createLogger({
  name: 'report-card',
  level: 'warn'
});

var defaultOptions = {
  complexity : {
    logicalor : true,
    switchcase : true,
    forin : false,
    trycatch : false,
    newmi : true
  },
  jshint : {} // use jshint defaults
};

function getHistoricalReport (outputDir) {
  return util.readJSON(outputDir + '/report.history.json', {}) || {};
}

function getReport (outputDir) {
  return util.readJSON(outputDir + '/report.json', {}) || {};
}

function writeReport(outputDir, filename, report) {
  var formatted = util.formatJSON(report);
  fs.writeFileSync(path.join(outputDir, filename) + '.json', formatted, 'utf8');
}

function writeHistoricalReport(outputDir, overview, options) {
  var existingData = getHistoricalReport(outputDir);
  var history = new OverviewHistory(existingData);
  history.addReport(overview);
  writeReport(outputDir, 'report.history', history.toJSON());
}

function renderReport(outputDir) {
  var reactTemplate = require('./client/components/report.jsx');
  fs.writeFileSync(path.join(outputDir, 'report.svg'), reactTemplate({outputDir: outputDir}), 'utf8');
}

function runReports(files, flags, options) {
  var commonBasePath = util.findCommonBase(files);
  var reports = [];

  return new Promise(function(resolve, reject) {
    _.each(files, function(file) {
      log.info('Reading "%s"', file);

      var fileShort = file.replace(commonBasePath, '');
      var fileSafe = fileShort.replace(/[^a-zA-Z0-9]/g,'_');
      var source = fs.readFileSync(file).toString().trim();
      if (!source) {
        log.info('Not parsing empty file "%s"', file);
        return;
      }

      // if skip empty line option
      if(options.noempty) {
        source = source.replace(/^\s*[\r\n]/gm ,'');
      }

      // if begins with shebang
      if (source[0] === '#' && source[1] === '!') {
        source = '//' + source;
      }
      var report = {
        info : {
          file : file,
          fileShort : fileShort,
          fileSafe : fileSafe,
          link : fileDir + '/' + fileSafe + '/index.html'
        }
      };

      var error = false;
      _.each(reporters,function(reporter, name) {
        if (!flags[name]) { return; }
        try {
          report[name] = reporter.process(source, flags[name], report.info);
        } catch (e) {
          error = true;
          log.error('Error reading file %s: ', file, e.toString());
          log.error(e.stack);
        }
      });

      if (error) { return; }
      reports.push(report);
    });
    resolve(reports);
  });
}

exports.inspect = function(files, options, done) {
  // Short circuit if there are no files to process
  if (!files) {
    throw new Error('No files provided');
  }

  // Generate Array of files to report on
  var excludedFiles = _.isArray(options.excludes) ? options.excludes : [options.excludes];
  excludedFiles = _.flatten(_.map(options.excludes, function(file) { return glob.sync(file); }));

  var includedFiles = _.chain(_.isArray(files) ? files : [files])
    .map(function(file) { return glob.sync(file); })
    .flatten()
    .difference(excludedFiles)
    .filter(function(file) { return file.match(/\.js$/); })
    .value();

  // Set reporter options
  var flags = _.cloneDeep(defaultOptions);
  _.each(flags, function (value, key, obj){
    obj[key] = _.clone(options[key] || value);
  });

  // Pull jsHint options
  // TODO: Refactor so it doesn't modify the original options
  if (options.jsHint) {
    if (!fs.statSync(options.jsHint).isFile()) {
      throw new Error('jsHint file: ' + options.jsHint + 'does not exist');
    }

    var json = fs.readFileSync(options.jsHint).toString();
    var jshintrc = JSON.parse(stripJsonComments(json));

    // TODO: What is this all about?
    options.jshint = { globals : jshintrc.globals || {} };
    delete jshintrc.globals;
    options.jshint.options = jshintrc;
  }

  var fileOutputDir = options.outputDir ? path.join(options.outputDir, fileDir) : false;
  runReports(includedFiles, flags, options)
    .then(function(reports) {
      fs.ensureDirSync(fileOutputDir);
      var overviewReport = exports.getOverviewReport(reports);
      writeHistoricalReport(options.outputDir, overviewReport, options);
      writeReport(options.outputDir, 'report', overviewReport);
      renderReport(options.outputDir);

      return reports;
    }).then(done);
};

// Filters out information unused in the overview for space/performance
exports.getOverviewReport = function (reports) {
  var culledReports = [];
  var summary = {
    total : {
      jshint: 0,
      sloc : 0,
      maintainability : 0,
    },
    average : {
      sloc : 0,
      maintainability : 0,
    }
  };

  reports.forEach(function(report) {
    // clone objects so we don't have to worry about side effects
    summary.total.sloc += report.complexity.aggregate.complexity.sloc.physical;
    summary.total.maintainability += report.complexity.maintainability;

    var aggregate = _.cloneDeep(report.complexity.aggregate);
    var reportItem = {};
    reportItem.info = report.info;
    if (report.jshint) {
      summary.total.jshint += report.jshint.messages.length;
      reportItem.jshint = {
        messages : report.jshint.messages.length
      };
    }
    /* jshint camelcase:false */
    if (report.complexity) {
      reportItem.complexity = {
        aggregate : aggregate,
        module : report.complexity.module,
        module_safe : report.complexity.module_safe,
        maintainability : _.cloneDeep(report.complexity.maintainability)
      };
    }
    /* jshint camelcase:true */
    culledReports.push(reportItem);
  });

  summary.average.sloc = parseInt(summary.total.sloc / reports.length);
  summary.average.jshint = (summary.total.jshint / reports.length).toFixed(2);
  summary.average.maintainability = (summary.total.maintainability / reports.length).toFixed(2);

  return {
    summary : summary,
    reports : culledReports
  };
};
