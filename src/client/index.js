import React, { useState } from "react";
import ReactDOM from "react-dom";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import Game from "./game";
import Join from "./join";
import Acrotest from "./acrotest";
import './App.scss';

function App(){
  const [room,setRoom] = useState('');
  const [name,setName] = useState('');

  return (
    <div>
      <Router>
        <Switch>
          <Route path='/test'>
            <Acrotest />
          </Route>
          <Route path='/'>
            {room.length === 0 ?
            <Join onJoin={(room,name) => {
              setRoom(room);
              setName(name);}} /> :
            <Game room={room} name={name} />} 
          </Route>
        </Switch>
      </Router>
    </div>
);
}

ReactDOM.render(<App />, document.body);
