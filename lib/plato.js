'use strict';

var path = require('path');
var fs = require('fs-extra'); // node api with sugar
var _ = require('lodash');
var glob = require('glob');
var bunyan = require('bunyan');

// local lib
var util = require('./util'),
    OverviewHistory = require('./models/OverviewHistory'),
    reporters = {
      complexity : require('./reporters/complexity'),
      jshint : require('./reporters/jshint')
    };

var assets = __dirname + '/assets/',
    fileDir = 'files';

var log = bunyan.createLogger({
  name: 'report-card',
  level: 'warn'
});

function unary(fn) { return function(a){ return fn(a);}; }

function getHistoricalReport (outputDir) {
  return util.readJSON(outputDir + '.history.json', {}) || {};
}

function writeReport(outfilePrefix, report) {
  var formatted = util.formatJSON(report);
  fs.writeFileSync(outfilePrefix + '.json', formatted, 'utf8');
}

function writeHistoricalReport(outputDir, overview, options) {
  var existingData = getHistoricalReport(outputDir);
  var history = new OverviewHistory(existingData);
  history.addReport(overview);
  writeReport(path.join(outputDir, 'report') + '.history', history.toJSON());
}

function renderReport(outputDir, report, options) {
  var template = _.template(fs.readFileSync(__dirname + '/templates/display.html').toString());
  var renderedTemplate = template({
    report : report,
    history : getHistoricalReport(outputDir),
    options : options
  });
  fs.writeFileSync(path.join(outputDir, 'display.html'), renderedTemplate, 'utf8');
}

exports.inspect = function(files, outputDir, options, done) {

	if (!files) {
	  // at least give me a file man...
	  return;
	}

  files = files instanceof Array ? files : [files];
  files = _.flatten(files.map(unary(glob.sync)));

  var flags = {
    complexity : {
      logicalor : true,
      switchcase : true,
      forin : false,
      trycatch : false,
      newmi : true
    },
    jshint : { } // use jshint defaults
  };

  Object.keys(flags).forEach(function(flag){
    if (flag in options) { flags[flag] = _.clone(options[flag]); }
  });

  if (options.q) { log.level('error'); }

  if (options.date) {
    // if we think we were given seconds
    if (options.date < 10000000000 ) { options.date = options.date * 1000; }
    options.date = new Date(options.date);
  }

  var reports = [];

  var fileOutputDir = outputDir ? path.join(outputDir, fileDir) : false;

  var commonBasePath = util.findCommonBase(files);

  var runReports = function(files, done) {
    files.forEach(function(file) {
      if (options.exclude && options.exclude.test(file)) { return; }

      if (options.recurse && fs.statSync(file).isDirectory()) {
        files = fs.readdirSync(file).map(function(innerFile) {
          return path.join(file,innerFile);
        });
        runReports(files);
      } else if (file.match(/\.js$/)) {
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
      }
    });
    if (done) { done(); }
  };

  if (!fileOutputDir) {
    runReports(files,function() {
      done(reports);
    });
  } else {
    fs.mkdirp(fileOutputDir,function() {
      runReports(files,function() {
        var reportFilePrefix = path.join(outputDir, 'report');

        fs.copy(assets, path.join(outputDir, 'assets'), function() {
          var overviewReport = exports.getOverviewReport(reports);
          writeHistoricalReport(outputDir, overviewReport, options);
          writeReport(reportFilePrefix, overviewReport);

          renderReport(outputDir, overviewReport, {
            title : options.title,
            flags : flags
          });

          done(reports);
        });
      });
    });
  }
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
