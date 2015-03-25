'use strict';

var levels = [
  'TRACE',
  'DEBUG',
  'INFO',
  'WARNING',
  'ERROR'
];

function Logger(level) {
  this.level = level;
}

levels.forEach(function(level, i){
  Logger[level] = i;
  Logger.prototype[level.toLowerCase()] = function() {
    if (i >= this.level) { console.log.apply(console,arguments); }
  };
});

module.exports = Logger;
