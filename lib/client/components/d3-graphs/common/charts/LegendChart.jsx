'use strict';

var React = require('react');

module.exports = React.createClass({
  propTypes: {
    sideOffset: React.PropTypes.number,
    data: React.PropTypes.oneOfType([
      React.PropTypes.object,
      React.PropTypes.array
    ])
  },

  getDefaultProps() {
    return {
      data: {},
      sideOffset: 90
    };
  },

  render() {
    return (
      <svg viewBox={this.props.viewBox} width={this.props.width - this.props.sideOffset} height={this.props.height}>{this.props.children}</svg>
    );
  }
});
