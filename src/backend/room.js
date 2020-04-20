const rooms = {};

const newRoom = (room) => {
  rooms[room] = { 'users':{}, 'acro':'' };
}

const addUser = (socketid,room,name) => {
  if (!rooms.hasOwnProperty(room)){
    newRoom(room); 
  }
  rooms[room]['users'][name] = { 'socketid':socketid, 
                                 'status':'connected', 
                                 'answer':''};
}

const disconnectUser = (room,name) => {
  if (rooms[room]['users'].hasOwnProperty(name))
  { 
    rooms[room]['users'][name]['status'] = 'disconnected';
  }
}

