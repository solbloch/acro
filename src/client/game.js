import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { Answer, Join, Vote, ViewRound, End } from "./states";
import { isSfxMuted, playPhaseSfx, toggleSfxMuted } from "./sfx";

const socket = io('acro.solb.io', {
  path: '/ws/'});

function Game({ room,name }){
  const [roomState, setRoomState] = useState({});
  const [muted, setMuted] = useState(isSfxMuted());
  const prevPhase = useRef('');

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

  useEffect(() => {
    if (!roomState.state || prevPhase.current === roomState.state) {
      return;
    }

    playPhaseSfx(roomState.state);
    prevPhase.current = roomState.state;
  }, [roomState.state]);

  const users = Object.values(roomState.users || {});
  const winners = users
    .slice()
    .sort((a,b) => b.points - a.points);

  const totalRounds = 5;
  const inRound = ['answer', 'vote', 'viewround', 'end'].includes(roomState.state);
  const roundFromAcro = roomState.acro ? roomState.acro.length - 2 : 0;
  const currentRound = inRound ? Math.max(1, Math.min(totalRounds, roundFromAcro)) : 0;
  const roundLabel = currentRound > 0 ? `Round: ${currentRound}/${totalRounds}` : `Round: -/${totalRounds}`;

  const onToggleMute = () => {
    setMuted(toggleSfxMuted());
  };

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
          <button className='button button--ghost button--tiny' type='button' onClick={onToggleMute}>
            {muted ? 'Unmute' : 'Mute'}
          </button>
        </div>
        <div className='game-topbar__meta'>
          <span className='meta-pill'>Room: {room}</span>
          <span className='meta-pill'>Name: {name}</span>
          <span className='meta-pill'>{roundLabel}</span>
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
