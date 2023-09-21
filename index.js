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
    console.log('masuk')
    console.log(users)
  });

  socket.on('disconnect', function() {
    console.log('Got disconnect!');
    for (const key in users) {
      if (users[key] === socket.id) {
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
    socket.to(users[data.client_id]).emit('server-to-client', data)
  });
});

server.listen(port, () => {
  console.log(`http://localhost:${port}`);
});