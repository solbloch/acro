import React, { useRef,useState,useEffect } from "react";
import io from "socket.io-client";
import { Answer, Join, Vote, ViewRound, End } from "./states";

const socket = io('localhost:5000');

function Game({ room,name }){
  const [roomState, setRoomState] = useState({});
  const [winners, setWinners] = useState([]);

  useEffect(() => {
    const roomListener = (roomState) => {
      setRoomState(roomState);

      let sorted = Object.values(roomState.users).sort((a,b) => {return b.points - a.points});

      setWinners(sorted.map(user => {
        return <li key={user.name}>
                 {user.name} has {user.points} points!
               </li>;
      }));
    };

    socket.on('updateRoom', roomListener);

    return () => {
      socket.off('updateRoom', roomListener);
    };
  }, [roomState, winners]);

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
    <div id='game'>
      <div id='roominfo'>room id: {room} | name: {name}</div>
        {roomState.acro === '' ? '' : 'ACRO: ' + roomState.acro}
        <br></br>
        {renderGame()}
        <br></br>
        current point leaders: <br></br>
        <ol>
          {winners}
        </ol>
    </div>
  );
}

export default Game;
