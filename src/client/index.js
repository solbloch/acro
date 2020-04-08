import React from "react";
import ReactDOM from "react-dom";
import io from "socket.io-client";

function App() {
  return <div><Join onSubmit={"e.preventDefault(); alert('tester');"} /></div>;
}

function Game({text}) {
  return <div>{text}</div>;
}

function Join({onSubmit}) {
    let socket = io('http://localhost:4000', {
        path: '/ws'
    });

    let input = React.createRef();

    function connect(e){
        e.preventDefault();
        socket.emit('create', input.current.value);
    }

    return (
        <div>
        <form onSubmit= {connect} >
            <label>room id</label>
            <input type="text" ref={input} />
            <input type="submit" value="Submit" />
        </form>
    </div>);
}

ReactDOM.render(<App />, document.body);
