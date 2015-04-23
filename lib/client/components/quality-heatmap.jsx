'use strict';

var React = require('react');
var Tile = require('./tile.jsx');
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
    return (
      <g transform={"translate(" + this.props.x + "," + this.props.y + ")"}>
        //TODO: Tooltip with per-file info on hover
        //TODO: Link to the real file on github
        <title>{this.props.name + ": " + this.props.score}</title>
        <rect
          width={this.props.dx}
          height={this.props.dy}
          style={{
            "fill": this.props.hasChildren ? "none" : color(this.props.score),
            "stroke": "white",
            "strokeWidth": "1.5px"
          }}/>
      </g>
    )
  }
});

var Treemap = React.createClass({
    getInitialState: function() {
      var svgWidth = 475;
      var svgHeight = 250;
      var treemap = d3.layout.treemap().size([svgWidth, svgHeight]).sticky(true).value(function(d) { return d.size; });

      var cells = treemap.nodes(formatData(this.props.report));
      return {
        svgWidth: svgWidth,
        svgHeight: svgHeight,
        cells: cells
      }
    },
    drawCells: function () {
      var cells = this.state.cells.map(function (cell, index) {
        return (<Cell
          pathSegment={index}
          hasChildren={cell.children ? true : false}
          name={cell.name}
          score={cell.score}
          x={cell.x}
          y={cell.y}
          dx={cell.dx}
          dy={cell.dy}/>
        ) })
      return cells;
    },
    render: function() {
        return (
          <Tile title='Quality Heatmap'
                width={this.props.width}
                height={this.props.height}
                x={this.props.x}
                y={this.props.y}>
            // TODO: Why is this ignoring x
            <g
              style={{"border": "2px solid black", "margin": "20px"}}
              width={this.state.svgWidth}
              height={this.state.svgHeight}>
              {this.drawCells()}
            </g>
          </Tile>
        )
    }
});

module.exports = Treemap;
