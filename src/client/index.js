import React from "react";
import ReactDOM from "react-dom";

function App() {
  return <Game text={"hello"} />;
}

function Game({ text }) {
  return <div>{text}</div>;
}

ReactDOM.render(<App />, document.body);
