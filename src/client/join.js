import React, { useState,useEffect } from "react";

function Join({ onJoin }){
  const roomName = React.createRef();
  const name = React.createRef();

  function connect(e){
    e.preventDefault();
    onJoin(roomName.current.value, name.current.value);
  }

  return ( 
    <div>
      <form onSubmit= {connect} >
        <label>room id</label>
        <input type="text" ref={roomName} /><br></br>
        <label>name</label><input type="text" ref={name} />
        <input type="submit" value="Submit" />
      </form>
    </div>
  );
}

export default Join;