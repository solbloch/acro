import React, { useRef,useState,useEffect } from "react";
import io from "socket.io-client";
import { Answer, Join, Vote, ViewRound, ViewSummary, End } from "./states";

const socket = io('acro.solb.io', {
  path: '/ws'
});

function Game({ room,name }){
  const [roomState, setRoomState] = useState({});

  useEffect(() => {
    const roomListener = (roomState) => {
      setRoomState(roomState);
    };

    socket.on('updateRoom', roomListener);

    return () => {
      socket.off('updateRoom', roomListener);
    };
  }, [roomState]);

  useEffect(() => {
    socket.emit('join', room, name);
  }, [room,name]);


  const renderGame = () => {
    switch (roomState.state){
      case 'join':{
        return <Join room={room} 
                     roomState={roomState}
                     name={name} 
                     socket={socket} />;
      }
      case 'answer':{
        return <Answer room={room} 
                       roomState={roomState}
                       name={name} 
                       socket={socket} />;
      }
      case 'vote':{
        return <Vote room={room} 
                     roomState={roomState}
                     name={name} 
                     socket={socket} />;
      }
      case 'viewround':{
        return <ViewRound room={room} 
                          roomState={roomState}
                          name={name} 
                          socket={socket} />;

      }
      case 'viewsummary':{
        return <ViewSummary room={room} 
                            roomState={roomState}
                            name={name} 
                            socket={socket} />;
      }
      case 'end':{
        return <End room={room} 
                     roomState={roomState}
                     name={name} 
                     socket={socket} />;
      }
      default:{
        break;
      }
    }
  }

  return (
    <div>room id: {room} | name: {name}
      <br></br>
      {roomState.acro === '' ? '' : 'ACRO: ' + roomState.acro}
      <br></br>
      {renderGame()}
    </div>
  );
}

export default Game;
