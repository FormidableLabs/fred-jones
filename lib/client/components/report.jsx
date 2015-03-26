'use strict';

var React = require('react');
var Treemap = require('./treemap.jsx');
var FileReport = require('./file-report.jsx');
var util = require('../../util.js');

var getReport = function(outputDir) {
  // TODO: Figure out how to get outpuDir here
  outputDir = outputDir || 'reports'
  return util.readJSON(outputDir + '/report.json', {}) || {};
}

var Report = React.createClass({
  render: function() {
    var style = {
      'fill': '#4C5F6D'
    };

    return (
      <svg width={this.props.width} height={this.props.height}>
        // Background
        <rect width='100%' height='100%' style={style} />

        // Report Tiles
        <FileReport height='250' width='250' report={getReport()}/>
        <Treemap height='250' width='250' x='250' report={getReport()}/>
      </svg>
    );
  }
});

module.exports = function(data) {
  // React doesn't support multiple outer tags or the xmlns attribute
  var svgPreamble = '<?xml version="1.0"?>'
  var svgBody = React.renderToStaticMarkup(<Report height='250' width='725'/>)
  return svgPreamble + '<svg xmlns="http://www.w3.org/2000/svg"' + svgBody.slice(4);
};
