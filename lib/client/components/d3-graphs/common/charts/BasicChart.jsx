'use strict';

var React = require('react');

module.exports = React.createClass({
  render: function() {
    return (
      <svg
        viewBox={this.props.viewBox}
        width={this.props.width}
        height={this.props.height}
      >{this.props.children}</svg>
    );
  }
});
