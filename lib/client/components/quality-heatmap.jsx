'use strict';

var React = require('react');
var d3 = require('d3');
var _ = require('lodash');
var colorbrewer = require('colorbrewer');

var setDeepProperty = function(obj, path, cellValues) {
  var schema = obj;  // a moving reference to internal objects within obj
  var length = path.length;

  _.each(path, function(value, index) {
    var pathSegment = path[index];
    schema.children = schema.children || [];
    if(!_.findWhere(schema.children, {name: pathSegment})) {
      schema.children.push({name: pathSegment});
    }
    schema = _.findWhere(schema.children, {name: pathSegment});
  })

  _.each(cellValues, function(value, key) {
    schema[key] = value;
  });
}

var getScore = function(file) {
  var lintErrors = file.jshint.messages;
  var cyclomaticComplexity = file.complexity.aggregate.cyclomatic;
  var halsteadDifficulty = file.complexity.aggregate.halstead.difficulty;

  return lintErrors + cyclomaticComplexity + halsteadDifficulty;
}

var formatData = function(data) {
  var tree = {name: "ROOT"};
  _.each(data.reports, function(fileReport) {
    var path = fileReport.info.file
      // TODO: use path.resolve to remove the ./ properly
      .split('/').slice(1);
    setDeepProperty(tree, path, {
      size: fileReport.complexity.aggregate.sloc.logical,
      score: getScore(fileReport)
    });
  })
  return tree;
};

var color = d3.scale.ordinal()
    .range(colorbrewer.RdYlGn[11]);

var Cell = React.createClass({
  getInitialState: function () {
    return {}
  },
  render: function () {
    var fill = this.props.hasChildren ? "none" : color(this.props.score)

    var createMarkup = function (dx, dy, fill) {
      //TODO: Link to the real file on github
      var rect = [
        '<a xlink:href="http://www.google.com">',
        '  <rect',
        '    width="' + dx + '"',
        '    height="' + dy + '"',
        '    style="fill:' + fill + '; stroke:white; strokeWidth:1.5px;"',
        '  />',
        '</a>'
      ].join('\n');

      return {__html: rect };
    };

    return (
      <g transform={"translate(" + this.props.x + "," + this.props.y + ")"}>
        <title>{this.props.name + ": " + this.props.score}</title>
        <g dangerouslySetInnerHTML={createMarkup(this.props.dx, this.props.dy, fill)} />
      </g>
    )
  }
});

var Treemap = React.createClass({
  getDefaultProps: function() {
    return {
      width: 600,
      height: 300,
      x: 0,
      y: 0,
      report: { reports: [] }
    };
  },
  getInitialState: function() {
    // TODO: Remove this crap
    var svgWidth = 475;
    var svgHeight = 250;

    var cells = d3.layout.treemap()
      .size([svgWidth, svgHeight])
      .sticky(true)
      .value(function(d) {
        return d.size;
      })
      .nodes(formatData(this.props.report));

    return { cells: cells };
  },
  drawCells: function () {
    var cells = this.state.cells.map(function (cell, index) {
      return (<Cell pathSegment={index}
                    hasChildren={cell.children ? true : false}
                    name={cell.name}
                    score={cell.score}
                    x={cell.x}
                    y={cell.y}
                    dx={cell.dx}
                    dy={cell.dy}/>
      )
    });
    return cells;
  },
  render: function() {
    // TODO: scale by to this.props.width this.props.height
    var x = this.props.x || 0;
    var y = this.props.y || 0;

    return (
      <g transform={"translate(" + x + ", " + y + ")"}
         style={{"border": "2px solid black", "margin": "20px"}}>
        {this.drawCells()}
      </g>
    )
  }
});

module.exports = Treemap;
