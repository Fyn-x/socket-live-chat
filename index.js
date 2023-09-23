const express = require('express');
const app = express();
const port = process.env.PORT || 8888;

const http = require('http');
const server = http.createServer(app);
const {Server} = require('socket.io')
const io = new Server(server, {cors: {origin: "*"}})

const users = {};
io.on('connection', (socket) => {
  socket.on('client-join', ({ id }) => {
    users[id] = socket.id;
    id == 'admin' ? socket.broadcast.emit('admin-online') : '';
    console.log(users)
  });

  socket.on('disconnect', function() {
    console.log('Got disconnect!');
    for (const key in users) {
      if (users[key] === socket.id) {
        key == 'admin' ? socket.broadcast.emit('admin-offline') : '';
        delete users[key];
        break;
      }
    }
    
    console.log(users);
  });

  socket.on('pesan-client', (data) => {
    if (users[data.id]) {
      socket.to(users['admin']).emit('client-to-admin', data);
    } 
  });

  socket.on('admin-to-client', (data) => {
    socket.to(users[data.client_id]).emit('admin-to-client', data)
  });

  socket.on('admin-typing', (data) => {
    socket.to(users[data.id]).emit('admin-typing', data)
  });

  socket.on('admin-untyping', (data) => {
    socket.to(users[data.id]).emit('admin-untyping', data)
  });

  socket.on('client-typing', (data) => {
    socket.to(users['admin']).emit('client-typing', data)
  });
});

server.listen(port, () => {
  console.log(`http://localhost:${port}`);
});