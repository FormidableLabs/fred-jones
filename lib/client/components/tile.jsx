'use strict';

var React = require('react');

var Title = React.createClass({
  render: function() {
    var style = {
      'text-anchor': 'middle',
      fill: '#000000',
      stroke: 'none',
      'font-size': '40px'
    }

    return (
      <g>
        <text x={this.props.width / 2} y='40' style={style}>
          {this.props.title}
        </text>
      </g>
    );
  }
});

var Tile = React.createClass({
  render: function() {
    return (
      <svg width={this.props.width}
           height={this.props.height}
           x={this.props.x || 0}
           y={this.props.y || 0} >

          if (this.props.title) {
            <Title title={this.props.title} width={this.props.width} />
          }
          <g>
            {this.props.children}
          </g>
      </svg>
    );
  }
});

module.exports = Tile;
