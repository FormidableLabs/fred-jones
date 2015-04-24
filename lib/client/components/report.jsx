'use strict';

var React = require('react');
var QualityHeatmap = require('./quality-heatmap.jsx');
var FileReport = require('./file-report.jsx');
var util = require('../../util.js');

var getReportData = function(outputDir) {
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
        <FileReport height='250' width='250' report={this.props.data}/>
        <QualityHeatmap height='250' width='475' x='250' report={this.props.data}/>
      </svg>
    );
  }
});

module.exports = function(options) {
  options = options || {};
  var data = getReportData(options.outputDir);

  // React doesn't support multiple outer tags or the xmlns attribute
  var svgPreamble = '<?xml version="1.0"?>'
  var svgNamespaces = [
    'xmlns="http://www.w3.org/2000/svg"',
    'xmlns:xlink="http://www.w3.org/1999/xlink"'
  ].join('\n');
  var svgBody = React.renderToStaticMarkup(<Report height='250' width='725' data={data}/>)
  return svgPreamble + '<svg ' + svgNamespaces + svgBody.slice(4);
};
