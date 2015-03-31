'use strict';

var program = require('commander');
var packageInfo = require('../package.json');
var plato = require('./plato');
var _ = require('lodash');

function processList(val) {
  return _.map(val.split(','), _.trim);
}

module.exports = function (argv) {
  program
    .version(packageInfo.version)
    .option('-v, --verbose', 'Extra verbose output')
    .option('-h, --jsHint [value]', 'Path to jsHint file')
    .option('-d, --outputDirectory [value]', 'Specify output directory relative to execution root')
    .option('-x, --excludes <files>', 'Files to exclude', processList)
    .option('-f, --files <files>', 'Files to process', processList)
    .parse(process.argv);

  plato.inspect(program.files, {
    verbose: program.verbose,
    jsHint: program.jsHint,
    excludes: program.excludes,
    outputDir: program.outputDirectory
  });
};
