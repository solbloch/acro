import React, { useRef,useState,useEffect } from "react";
import io from "socket.io-client";

function Join({ room,name,socket }){
  const [readyState, setReadyState] = useState(false);

  const emitReady = () => {
    socket.emit('ready', room);
    setReadyState(true);
  }
  return (
    <button onClick={emitReady}
            disabled={readyState}>
    ready</button>
  );
}


function Answer({ room,roomState,name,socket }){
  const [answerState, setAnswerState] = useState('');
  const [errorState, setErrorState] = useState('');
  const answerRef = useRef();

  const acroCheck = txt => {
    let words = txt.replace(/[!?.,;:]/g,'').trim().toUpperCase().split(/\s+/);
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
      setErrorState('Non-matching.');
    }
  };

  const answered = () => {
    return answerState.length > 0
  };

  return (
    <div>
    timer: {roomState.time} <br></br>
    {answered() ?
      answerState : 
      <form onSubmit={emitAnswer} >
        <label>answer</label>
        <input type="text" ref={answerRef} />
      </form>
     }
    <div>{errorState}</div>
    </div>);
}


function Vote({ room,roomState,name,socket }){
  // voteState true if voted, false otherwise.
  const [voteState, setVoteState] = useState(false);

  const emitVote = (vote) => {
    return () => {
      setVoteState(true);
      socket.emit('vote', room, socket.id, vote)
    };
  }

  const votable = () => {
    if(!voteState){
      return Object.entries(roomState.users).map(([socketid,data]) => {
        if(socketid != socket.id){
          return <button key={socketid} onClick={emitVote(socketid)}>
                   {roomState.users[socketid].answer}
                 </button>;
        }
        else {
          return <button key={socketid} disabled='true'>
                   {roomState.users[socketid].answer}
                 </button>;
        }
      });
    }
    else {
      return Object.entries(roomState.users).map(([socketid,data]) => {
        return <button key={socketid} disabled='true'>
                 {roomState.users[socketid].answer}
               </button>;
      });
    }
  }

  return (
    <div>
    timer: {roomState.time} <br></br>
    {votable()}
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

    let sortedList = Object.entries(voteNum).sort((a,b) => b[1] - a[1]).map(user => {
      return [roomState.users[user[0]].name, user[1]];
    });

    return sortedList.map(user => {
      return <li>{user[0]} has {user[1]}</li>;
    });

  }

  return (
    <div>
    timer: {roomState.time} <br></br>
    <ol>
    {returnPoints()}
    </ol>
    </div>
  );
}

function ViewSummary({ room,roomState,name,socket }){
  let sorted = Object.values(roomState.users).sort((a,b) => {return b.points - a.points});

  let winners = [];
  for(let user in sorted){
      winners.push(<div key={sorted[user].name}>
        user: {sorted[user].name} scored: {sorted[user].points}
        </div>);
  }
  return(
    <div>
    timer: {roomState.time}
    point leaders: <br></br>
    {winners}
    </div>
  );
}


function End({ room,roomState,name,socket }){
  let sorted = Object.values(roomState.users).sort((a,b) => {return b.points - a.points});

  let winners = [];
  for(let user in sorted){
      winners.push(<div key={sorted[user].name}>
        user: {sorted[user].name} scored: {sorted[user].points}
        </div>);
  }
  return(
    <div>
    {winners}
    </div>
  );
}

export { Answer, Join, Vote, ViewRound, ViewSummary, End };
