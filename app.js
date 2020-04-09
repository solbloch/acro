const io = require('socket.io')({
  path: '/ws',
  serveClient: false,
})

const server = require('http').createServer()

io.attach(server, { })

io.on('connection', (socket) => {
  console.log('bastard!');

  socket.on('create', (room, name) => {
    socket.join(room);
    console.log('USER:',name,' JOINED:', room);
  });

  socket.on('msg', (text,room) => {
    io.to(room).emit('msgRec',text);
    console.log("text:",text,"| room:",room);
  });

});

server.listen(4000);
