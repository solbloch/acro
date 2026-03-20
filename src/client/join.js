import React from "react";

function Join({ onJoin }){
  const roomName = React.createRef();
  const name = React.createRef();

  function connect(e){
    e.preventDefault();
    onJoin(roomName.current.value.toUpperCase(), name.current.value);
  }

  return ( 
    <main className='landing'>
      <section className='panel landing__panel'>
        <div className='panel__header'>
          <h1 className='landing__title'>Acro</h1>
        </div>

        <form className='join-form' onSubmit={connect}>
          <label className='field'>
            <span>Room</span>
            <input type='text' ref={roomName} placeholder='ABCD' maxLength='12' />
          </label>

          <label className='field'>
            <span>Name</span>
            <input type='text' ref={name} placeholder='Name' maxLength='24' />
          </label>

          <button className='button button--primary' type='submit'>
            Join
          </button>
        </form>
      </section>
    </main>
  );
}

export default Join;
