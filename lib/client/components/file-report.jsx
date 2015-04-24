'use strict';

var React = require('react');
var _ = require('lodash');

var FileReport = React.createClass({
  getDefaultProps: function() {
    var report = {
      summary: {
        average: {
          sloc: "n/a",
          jshint: "n/a",
          maintainability: "n/a"
        }
      }
    }

    return {
      width: 600,
      height: 300,
      x: 0,
      y: 0,
      report: report
    }
  },

  render: function() {
    var textStyle = {
      fill: '#000000',
      stroke: 'none',
      'font-size': '25px'
    };

    var titleStyle = {
      'text-anchor': 'middle',
      fill: '#000000',
      stroke: 'none',
      'font-size': '40px'
    }

    // TODO: scale by to this.props.width this.props.height
    var x = this.props.x || 0;
    var y = this.props.y || 0;

    return (
      <g transform={"translate(" + x + ", " + y + ")"}
         style={{"border": "2px solid black", "margin": "20px"}}>
        <text x={this.props.width / 2} y='40' style={titleStyle}>
          Summary
        </text>
        <text x='50' y='60' style={textStyle}>
          <tspan x='0' dy='1.2em'>Lines of Code: { this.props.report.summary.average.sloc }</tspan>
          <tspan x='0' dy='1.2em'>Lint Errors: { this.props.report.summary.average.jshint }</tspan>
          <tspan x='0' dy='1.2em'>Maintainability: { this.props.report.summary.average.maintainability }</tspan>
        </text>
      </g>
    );
  }
});

module.exports = FileReport;
