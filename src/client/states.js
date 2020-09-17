import React, { useRef,useState,useEffect } from "react";
import Acrotest from "./acrotest";
import io from "socket.io-client";

function Options({ room,roomState,name,socket }){
  return <Acrotest />
}

function Join({ room,roomState,name,socket }){
  const [readyState, setReadyState] = useState(false);
  const [options, setOptions] = useState(false);

  const emitReady = () => {
    socket.emit('ready', room);
    setReadyState(true);
  }

  const emitFreqList = (freqList) => {
    socket.emit('updatefreqlist', room, socket.id, freqList);
  }

  return (
    <div id='users'>
      users joined: {Object.values(roomState.users).map(user => {
        return (
          <div>
            {user.admin ? <b>*{user.name}</b> : user.name} 
              &nbsp;|&nbsp;
            {user.ready ? 'ready' : 'not ready'}
          </div>); 
      })}
      <button onClick={emitReady} disabled={readyState}>
        Ready
      </button>
      { roomState.users[socket.id].admin ?
      <button onClick={() => setOptions(!options)} disabled={readyState}>
        Options </button> : <div></div>}
      { options ? 
        <Acrotest 
          currentFreqList={roomState.freqList}
          updateFunction={(freqList) => emitFreqList(freqList)} /> 
        : <div></div> }
    </div>
  );
}


function Answer({ room,roomState,name,socket }){
  const [answerState, setAnswerState] = useState('');
  const [errorState, setErrorState] = useState('');
  const answerRef = useRef();

  const acroCheck = txt => {
    let words = txt.replace(/[!?.,;:+\"\'\-]/g,'').trim().toUpperCase().split(/\s+/);
    let matching = true;
    for(let i in roomState.acro){
      if(roomState.acro[i] != words[i][0]){
        matching = false;
        break;
      }
    }
    return matching;
  }

  const emitAnswer = e => {
    e.preventDefault();
    let text = answerRef.current.value;
    if(acroCheck(text)){
      setAnswerState(text);
      socket.emit('answer', room, name, text);
      setErrorState('');
    }
    else {
      setErrorState('Entry doesn\'t match given acronym.');
    }
  };

  const answered = () => {
    return answerState.length > 0
  };

  return (
    <>
      <div id='timer'>timer: {roomState.time}</div>
      {answered() ?
        answerState : 
        <form onSubmit={emitAnswer} >
          <label>answer</label>
          <input type="text" ref={answerRef} />
        </form>
       }
      <div>{errorState}</div>
    </>);
}


function Vote({ room,roomState,name,socket }){
  // voteState true if voted, false otherwise.
  const [voteState, setVoteState] = useState(false);

  // Stolen from stackoverflow.
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const [voteableList, setVoteableList] = 
    useState(shuffle(Object.entries(roomState.users).filter(([socketid,user]) => {
      return user.answer.length > 0
    })));

  const emitVote = (vote) => {
    return () => {
      setVoteState(true);
      socket.emit('vote', room, socket.id, vote)
    };
  }

  const buttonizeVoteable = (each) => {
    let [socketid,user] = each;
    if(socketid === socket.id || voteState){
      return <button key={socketid} disabled='true' onClick={emitVote(socketid)}>
               {user.answer}</button>;
    }
    else {
      return <button key={socketid} onClick={emitVote(socketid)}>
               {user.answer}</button>;
    }
  }

  const voteButtons = () => {
    return voteableList.map(buttonizeVoteable);
  }

  return (
    <>
      <div id='timer'>timer: {roomState.time}</div>
      {voteButtons()}
    </>);
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
      return <li>{roomState.users[user[0]].name} got {user[1]} with {roomState.users[user[0]].answer}</li>;
    });

  }

  return (
    <>
      <div id='timer'>timer: {roomState.time}</div>
      <ol>
      {returnPoints()}
      </ol>
    </>
  );
}

function End({ room,roomState,name,socket }){
  let sorted = Object.values(roomState.users).sort((a,b) => {return b.points - a.points});

  let winners = sorted.map(user => {
    return <li key={user.name}>
      user: {user.name} has {user.points} points
      </li>; 
  });

  return(
    <>
      <div id='timer'>timer: {roomState.time}</div>
      winners: <br></br>
      <ol>
        {winners}
      </ol>
    </>
  );
}

export { Answer, Join, Vote, ViewRound, End };
