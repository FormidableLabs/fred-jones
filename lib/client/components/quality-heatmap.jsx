'use strict';

var React = require('react');
var d3 = require('d3');
var _ = require('lodash');
var Tile = require('./tile.jsx');
var Treemap = require('./d3-graphs/treemap');

var getScore = function(file) {
  var lintErrors = file.jshint.messages;
  var cyclomaticComplexity = file.complexity.aggregate.cyclomatic;
  var halsteadDifficulty = file.complexity.aggregate.halstead.difficulty;

  return lintErrors + cyclomaticComplexity + halsteadDifficulty;
}

var generateTreemapData = function(report) {
  return _.map(report.reports, function(file) {
    return {
      label: file.info.fileShort,
      value: getScore(file)
    }
  });
}

var QualityHeatmap = React.createClass({
  getDefaultProps: function() {
    return {
      width: 600,
      height: 300
    }
  },

  render: function() {
    return (
      <Tile width={this.props.width}
        height={this.props.height}
        x={this.props.x}
        y={this.props.y}>
        <Treemap
          width={450}
          height={250}
          title="Treemap"
          data={generateTreemapData(this.props.report)}
          textColor="#484848"
          fontColor="12px"
        />
      </Tile>
    );
  }
});

module.exports = QualityHeatmap;
