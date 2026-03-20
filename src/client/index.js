import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import Game from "./game";
import Join from "./join";
import Acrotest from "./acrotest";
import { unlockSfx } from "./sfx";
import './App.scss';

function App(){
  const [room,setRoom] = useState('');
  const [name,setName] = useState('');
  document.title = 'Acro';

  useEffect(() => {
    const unlock = () => {
      unlockSfx();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };

    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);

    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  return (
    <div className='app-shell'>
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

  ReactDOM.render(<App />, document.getElementById('root'));
