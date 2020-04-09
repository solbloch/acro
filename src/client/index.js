import React, { useState } from "react";
import ReactDOM from "react-dom";
import Game from "./game";
import Join from "./join";

function App(){
  const [room,setRoom] = useState('');
  const [name,setName] = useState('');

  return (room.length === 0 ?
    <Join onJoin={(room,name) => {
      setRoom(room);
      setName(name);}} /> :
    <Game room={room} name={name} />
  );
}

ReactDOM.render(<App />, document.body);
