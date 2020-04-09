import React, { useRef,useState,useEffect } from "react";
import io from "socket.io-client";

const socket = io('http://192.168.1.170:4000', {
  path: '/ws'
});

function Game({ room,name }){
  const [messages, setMessages] = useState([]);
  const messageText = useRef();

  useEffect(() => {
    const listener = (msg,room) => {
      console.log([...messages,msg]);
      setMessages([...messages,msg]);
    };

    socket.on('msgRec', listener);

    return () => {
      socket.off('msgRec', listener);
    };
  }, [messages]);

  useEffect(() => {
    socket.emit('create', room, name);
  }, [room,name]);

  function send(e){
    e.preventDefault();
    socket.emit('msg', messageText.current.value, room);
  }

  return (
    <div>room id: { room } | name: {name}
      <form onSubmit= {send} >
        <label>send msg</label>
        <input type="text" ref={messageText} />
        <input type="submit" value="Submit" />
      </form>
      <div>{messages.toString()}</div>
    </div>
  );
}

export default Game;
