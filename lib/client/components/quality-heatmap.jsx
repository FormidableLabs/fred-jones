'use strict';

var React = require('react');
var d3 = require('d3');
var _ = require('lodash');

var setDeepProperty = function(obj, path, value) {
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

  schema.size = value;
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
    setDeepProperty(tree, path, getScore(fileReport));
  })
  return tree;
};

var color = d3.scale.category20c();

var Cell = React.createClass({
  getInitialState: function () {
    return {}
  },
  render: function () {
    return (
      <g transform={"translate(" + this.props.x + "," + this.props.y + ")"}>
        //TODO: Tooltip with per-file info on hover
        //TODO: Link to the real file on github
        <title>{this.props.name}</title>
        <rect
          width={this.props.dx}
          height={this.props.dy}
          style={{
            "fill": this.props.hasChildren ? "none" : color(this.props.name),
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
          x={cell.x}
          y={cell.y}
          dx={cell.dx}
          dy={cell.dy}/>
        ) })
      return cells;
    },
    render: function() {
        return (
          <g
            style={{"border": "2px solid black", "margin": "20px"}}
            width={this.state.svgWidth}
            height={this.state.svgHeight}>
            {this.drawCells()}
          </g>
        )
    }
});

module.exports = Treemap;
