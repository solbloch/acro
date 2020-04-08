const io = require('socket.io')({
  path: '/ws',
  serveClient: false,
})

const server = require('http').createServer()

io.attach(server, {
})

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('create', (room) => {
        socket.join(room);
        let rooms = Object.keys(socket.rooms)
        console.log(rooms);
    });
});

server.listen(4000);
