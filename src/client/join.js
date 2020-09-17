import React, { useState,useEffect } from "react";

function Join({ onJoin }){
  const roomName = React.createRef();
  const name = React.createRef();

  function connect(e){
    e.preventDefault();
    onJoin(roomName.current.value.toUpperCase(), name.current.value);
  }

  return ( 
    <div>
      <form id='join' onSubmit= {connect} >
        <div>room<input type="text" ref={roomName} /></div>
        <div>name<input type="text" ref={name} /></div>
        <input type="submit" value="Submit" />
      </form>
    </div>
  );
}

export default Join;
