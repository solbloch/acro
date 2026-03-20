import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { Answer, Join, Vote, ViewRound, End } from "./states";

const socket = io('acro.solb.io', {
  path: '/ws/'});

function Game({ room,name }){
  const [roomState, setRoomState] = useState({});

  useEffect(() => {
    const roomListener = (nextRoomState) => {
      setRoomState(nextRoomState);
    };

    socket.on('updateRoom', roomListener);

    return () => {
      socket.off('updateRoom', roomListener);
    };
  }, []);

  useEffect(() => {
    socket.emit('join', room, name);
  }, [room,name]);

  const users = Object.values(roomState.users || {});
  const winners = users
    .slice()
    .sort((a,b) => b.points - a.points);

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
    <main className='game-shell'>
      <section className='game-topbar panel'>
        <div className='game-topbar__main'>
          <h1 className='game-topbar__title'>Acro</h1>
        </div>
        <div className='game-topbar__meta'>
          <span className='meta-pill'>Room: {room}</span>
          <span className='meta-pill'>Name: {name}</span>
        </div>
      </section>

      <section className='game-layout'>
        <div className='panel panel--round'>
          {renderGame()}
        </div>

        <aside className='panel panel--sidebar'>
          <div className='panel__header'>
            <h2>Scores</h2>
          </div>

          <ol className='leaderboard'>
            {winners.map((user, index) => (
              <li className='leaderboard__item' key={user.name}>
                <span className='leaderboard__rank'>#{index + 1}</span>
                <div className='leaderboard__copy'>
                  <strong>{user.name}</strong>
                  <span>{user.points}</span>
                </div>
              </li>
            ))}
          </ol>
        </aside>
      </section>
    </main>
  );
}

export default Game;
