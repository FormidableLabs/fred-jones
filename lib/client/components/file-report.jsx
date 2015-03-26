'use strict';

var React = require('react');
var _ = require('lodash');
var Tile = require('./tile.jsx');

var FileReport = React.createClass({
  getDefaultProps: function() {
    return {
      width: 600,
      height: 300
    }
  },

  render: function() {
    var textStyle = {
      fill: '#000000',
      stroke: 'none',
      'font-size': '25px'
    };

    return (
      <Tile title='File Summary'
            width={this.props.width}
            height={this.props.height}
            x={this.props.x}
            y={this.props.y}>
        // TODO: Why is this ignoring x
        <text x='50' y='60' style={textStyle}>
          <tspan x='0' dy='1.2em'>Lines of Code: { this.props.report.summary.average.sloc }</tspan>
          <tspan x='0' dy='1.2em'>Lint Errors: { this.props.report.summary.average.jshint }</tspan>
          <tspan x='0' dy='1.2em'>Maintainability: { this.props.report.summary.average.maintainability }</tspan>
        </text>
      </Tile>
    );
  }
});

module.exports = FileReport;
