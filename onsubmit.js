import React from "react";
import socketIOClient from "socket.io-client";

var OnSubmitTest = React.createClass({

  submit: function(e){
    e.preventDefault();
    alert('it works!');
  }

  render: function() {
    return (
      <form onSubmit={this.submit}>
        <button>Click me</button>
      </form>
    );
  }
});
