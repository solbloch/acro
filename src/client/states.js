import React, { useEffect, useRef, useState } from "react";
import Acrotest from "./acrotest";
import {
  playCountdownSfx,
  playReadySfx,
  playSendSfx,
  playVoteSfx,
} from "./sfx";

function Join({ room,roomState,name,socket }){
  const [readyState, setReadyState] = useState(false);
  const [options, setOptions] = useState(false);
  const users = Object.values(roomState.users || {});
  const currentUser = roomState.users ? roomState.users[socket.id] : null;

  const emitReady = () => {
    socket.emit('ready', room);
    setReadyState(true);
    playReadySfx();
  }

  const emitFreqList = (freqList) => {
    socket.emit('updatefreqlist', room, socket.id, freqList);
  }

  return (
    <div className='round-state round-state--lobby'>
      <div className='panel__header'>
        <h2>Players</h2>
      </div>

      <div className='roster'>
        {users.map((user) => (
          <div className='roster__item' key={user.name}>
            <div className='roster__identity'>
              <strong>{user.name}</strong>
              {user.admin ? <span className='status-chip status-chip--accent'>host</span> : null}
            </div>
            <span className={`status-chip ${user.ready ? 'status-chip--success' : 'status-chip--muted'}`}>
              {user.ready ? 'ready' : 'waiting'}
            </span>
          </div>
        ))}
      </div>

      <div className='action-row'>
        <button className='button button--primary' onClick={emitReady} disabled={readyState}>
          {readyState ? 'Ready' : 'Ready'}
        </button>
        {currentUser && currentUser.admin ? (
          <button
            className='button button--ghost'
            onClick={() => setOptions(!options)}
            disabled={readyState}
          >
            {options ? 'Hide options' : 'Options'}
          </button>
        ) : null}
      </div>

      {options ? (
        <Acrotest
          currentFreqList={roomState.freqList}
          updateFunction={(freqList) => emitFreqList(freqList)}
        />
      ) : null}
    </div>
  );
}


function Answer({ room,roomState,name,socket }){
  const [answerState, setAnswerState] = useState('');
  const [errorState, setErrorState] = useState('');
  const answerRef = useRef();
  const submittedRef = useRef(false);
  const lastCountdownRef = useRef(null);

  const acroCheck = txt => {
    let words = txt.replace(/[!?.,;:+\"\'\-]/g,'').trim().toUpperCase().split(/\s+/);

    if (words.length !== roomState.acro.length) {
      return false;
    }

    for(let i in roomState.acro){
      if(!words[i] || roomState.acro[i] !== words[i][0]){
        return false;
      }
    }

    return true;
  }

  const trySubmit = (text, shouldSetError) => {
    if (submittedRef.current || text.length === 0) {
      return false;
    }

    if(acroCheck(text)){
      submittedRef.current = true;
      setAnswerState(text);
      socket.emit('answer', room, name, text);
      playSendSfx();
      setErrorState('');
      return true;
    }

    if (shouldSetError) {
      setErrorState('Entry doesn\'t match given acronym.');
    }

    return false;
  };

  const emitAnswer = e => {
    e.preventDefault();
    let text = answerRef.current.value;
    trySubmit(text, true);
  };

  const answered = () => {
    return answerState.length > 0
  };

  useEffect(() => {
    if (roomState.time === 1 && answerRef.current) {
      trySubmit(answerRef.current.value.trim(), false);
    }
  }, [roomState.time]);

  useEffect(() => {
    if (
      !answered() &&
      roomState.time > 0 &&
      roomState.time <= 3 &&
      lastCountdownRef.current !== roomState.time
    ) {
      lastCountdownRef.current = roomState.time;
      playCountdownSfx();
    }
  }, [roomState.time, answerState]);

  useEffect(() => {
    return () => {
      if (answerRef.current) {
        trySubmit(answerRef.current.value.trim(), false);
      }
    };
  }, []);

  return (
    <div className='round-state'>
      <div className='timer-badge'>{roomState.time}</div>
      <div className='acro-focus' aria-label='Current acronym'>
        {roomState.acro}
      </div>

      {answered() ?
        <div className='submission-card'>
          <span className='status-chip status-chip--success'>sent</span>
          <strong>{answerState}</strong>
        </div> : 
        <form className='stack-form' onSubmit={emitAnswer} >
          <input type="text" ref={answerRef} placeholder='Your answer' aria-label='Answer input' />
          <button className='button button--primary' type='submit'>Send</button>
        </form>
       }
      {errorState ? <div className='form-error'>{errorState}</div> : null}
    </div>);
}


function Vote({ room,roomState,name,socket }){
  // voteState true if voted, false otherwise.
  const [voteState, setVoteState] = useState(false);
  const lastCountdownRef = useRef(null);

  const voteableList = Object.entries(roomState.users).filter(([socketid,user]) => {
    return user.answer.length > 0;
  });

  const emitVote = (vote) => {
    return () => {
      setVoteState(true);
      socket.emit('vote', room, socket.id, vote);
      playVoteSfx();
    };
  }

  useEffect(() => {
    if (
      !voteState &&
      roomState.time > 0 &&
      roomState.time <= 3 &&
      lastCountdownRef.current !== roomState.time
    ) {
      lastCountdownRef.current = roomState.time;
      playCountdownSfx();
    }
  }, [roomState.time, voteState]);

  const buttonizeVoteable = (each) => {
    let [socketid,user] = each;
    if(socketid === socket.id || voteState){
      return <button className='vote-card' key={socketid} disabled={true} onClick={emitVote(socketid)}>
               {user.answer}</button>;
    }
    else {
      return <button className='vote-card' key={socketid} onClick={emitVote(socketid)}>
               {user.answer}</button>;
    }
  }

  const voteButtons = () => {
    return voteableList.map(buttonizeVoteable);
  }

  return (
    <div className='round-state'>
      <div className='timer-badge'>{roomState.time}</div>
      <div className='panel__header'>
        <h2>Vote</h2>
      </div>
      <div className='vote-grid'>
        {voteButtons()}
      </div>
    </div>);
}

function ViewRound({ room,roomState,name,socket }){
  const returnPoints = () => {
    // NOTE: Votes are socketids.
    let votes = Object.values(roomState.users).map(user => user.vote);

    // Remove empty string votes.
    votes = votes.filter(vote => vote.length>0);

    let voteNum = {};
    for(let vote in votes){
      if(voteNum.hasOwnProperty(votes[vote])){
        voteNum[votes[vote]]++;
      }
      else {
        voteNum[votes[vote]] = 1;
      }
    }
    
    // Keep track of highest points to add bonus.
    let highestPoints = 0;
    let highestPlayer = [];

    for(let [vote,points] of Object.entries(voteNum)){
      if(points > highestPoints){
        highestPoints = points;
        highestPlayer = [vote];
      }
      else if(points === highestPoints){
        highestPlayer.push(vote);
      }
    }

    for(let i in highestPlayer){
      voteNum[highestPlayer[i]] += roomState.acro.length;
    }

    let sortedList = Object.entries(voteNum).sort((a,b) => b[1] - a[1]);

    return sortedList.map(user => {
      return <li className='result-list__item' key={user[0]}>{roomState.users[user[0]].name} +{user[1]} {roomState.users[user[0]].answer}</li>;
    });

  }

  return (
    <div className='round-state'>
      <div className='timer-badge'>{roomState.time}</div>
      <div className='panel__header'>
        <h2>Round</h2>
      </div>
      <ol className='result-list'>
      {returnPoints()}
      </ol>
    </div>
  );
}

function End({ room,roomState,name,socket }){
  let sorted = Object.values(roomState.users).sort((a,b) => {return b.points - a.points});

  let winners = sorted.map(user => {
    return <li className='result-list__item' key={user.name}>
      {user.name} {user.points}
      </li>; 
  });

  return(
    <div className='round-state'>
      <div className='timer-badge'>{roomState.time}</div>
      <div className='panel__header'>
        <h2>Final</h2>
      </div>
      <ol className='result-list'>
        {winners}
      </ol>
    </div>
  );
}

export { Answer, Join, Vote, ViewRound, End };
