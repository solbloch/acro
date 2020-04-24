const acronym = require("./acro");

const io = require('socket.io')({
  path: '/ws',
  serveClient: false,
});

const server = require('http').createServer();

const rooms = {};

const newRoom = (room) => {
  if(rooms.hasOwnProperty(room)){
    return false;
  }
  rooms[room] = { 'users':{}, 'acro':'', 'state':'join', 'time':0 };
}

const addUser = (socketid,room,name) => {
  rooms[room].users[socketid] = { 'name':name,
                                     'points':0,
                                     'vote':'',
                                     'answer':'',
                                     'connected':true,
                                     'ready':false};
}

const connectUser = (socketid,room,name) => {
  if (!rooms.hasOwnProperty(room)){
    newRoom(room); 
  }

  // Reconnect user, if possible.
  let reconnected = false;

  for(let socket in rooms[room].users){
    let user = rooms[room].users[socket];
    if(user.name === name && !user.connected){
      rooms[room].users[socketid] = user;
      rooms[room].users[socketid].connected = true;
      delete rooms[room].users[socket];
      reconnected = true;
      break;
    }
  }

  // Note: this idiom exists in python (for else), but
  // not in JS. Maybe there's a bettter way?
  
  if(!reconnected){
    addUser(socketid,room,name);
  }
  
  io.to(room).emit('updateRoom', rooms[room]);
}

const disconnectUser = (socketid,room,name) => {
  if(rooms.hasOwnProperty(room)){
    if (rooms[room].users.hasOwnProperty(socketid))
    { 
      rooms[room].users[socketid].connected = false;

      // If all users disconnected, delete room.
      if(Object.values(rooms[room].users).every(user => !user.connected)){
        console.log(`room deleted: ${room}`);
        delete rooms[room]; 
      }
    }
  }
}

const everyConnected = (room, func) => {
  let connectedUsers = Object.values(rooms[room].users).filter(user => user.connected);
  return connectedUsers.every(func);
}

const addPoints = (room) => {
  // NOTE: Votes are socketids.
  let votes = Object.values(rooms[room].users).map(user => user.vote);

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
    rooms[room].users[vote].points += points;
  }

  // Apply bonus points to all players that earned it (number of letter in acro).
  for(let player in highestPlayer){
    rooms[room].users[highestPlayer[player]].points += rooms[room].acro.length;
  }
}

const emitUpdate = (room) => {
  io.to(room).emit('updateRoom', rooms[room]);
}

async function updateRoom(room) {
  emitUpdate(room);
  if(Object.keys(rooms[room].users).length > 1 &&
    everyConnected(room, user => user.ready )){
    gameRun(room);
  }
}

async function gameRun(room){
  // Once everyone is readied up.

  // Loop over 3 to final acro length.
  for(let acroLength = 3; acroLength <= 7; acroLength++){
    // Timer for answering.
    let timer = 0;

    rooms[room].state = 'answer';
    rooms[room].acro = acronym.generateAcro(acroLength);

    for(timer = rooms[room].acro.length * 15; timer > 0; timer--){
      await new Promise(r => setTimeout(r,1000));
      rooms[room].time = timer;
      if(everyConnected(room, user => user.answer.length > 0 )){
        break;
      }
      emitUpdate(room);
    }

    // Timer for voting.
    rooms[room].state = 'vote';

    for(timer = 40; timer > 0; timer--){
      await new Promise(r => setTimeout(r,1000));
      rooms[room].time = timer;
      if(everyConnected(room, user => user.vote.length > 0 )){
        break;
      }
      emitUpdate(room);
    }

    addPoints(room);


    // Viewing round scores.
    rooms[room].state = 'viewround';

    for(timer = 10; timer > 0; timer--){
      await new Promise(r => setTimeout(r,1000));
      rooms[room].time = timer;
      emitUpdate(room);
    }

    // Reset answers and votes.
    Object.values(rooms[room].users).map(user => {
      user.answer = '';
      user.vote = '';
    });

    emitUpdate(room);
  }

  rooms[room].state = 'end';
  emitUpdate(room);
  delete rooms[room];
}

io.attach(server, { });

io.on('connection', (socket) => {
  let nameConnection = '';
  let roomConnection = '';

  console.log('bastard!',' ',socket.id);

  socket.on('join', (room, name) => {
    socket.join(room);
    console.log('USER:', name, ' JOINED:', room);
    connectUser(socket.id,room,name);
    nameConnection = name;
    roomConnection = room;
  });

  socket.on('ready', (room) => {
    console.log(`READY: ${socket.id}, ${room}`);
    rooms[room].users[socket.id].ready = true;
    updateRoom(room);
  });

  socket.on('answer', (room, name, answer) => {
    console.log(`ANS: ${socket.id}, ${room}, ${answer}`);
    rooms[room].users[socket.id].answer = answer;
  });


  socket.on('vote', (room, socketid, vote) => {
    console.log(`VOTE: ${socketid}, ${room}, ${vote}`);
    rooms[room].users[socketid].vote = vote;
  });

  socket.on('disconnect', () => {
    console.log(`DISCONNECT: ${socket.id}, ${roomConnection}, ${nameConnection}`);
    if (!(roomConnection ==='' && nameConnection === '')){
      disconnectUser(socket.id, roomConnection, nameConnection);
    }
  });

});

server.listen(5000);
