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
    adminStatus = 'admin' in users ? 'online' : 'offline';
    io.sockets.emit('admin-status', adminStatus);
    console.log(users)
  });

  socket.on('client-enter', (data)=>{
    io.sockets.to(users['admin']).emit('client-enter', data)
  })

  socket.on('cek-admin-status', () => {
    var adminStatus;
    if ('admin' in users) {
      adminStatus = 'online';
    } else {
      adminStatus = 'offline';
    }

    socket.emit('admin-status', adminStatus)
  })

  socket.on('disconnect', function() {
    console.log('Got disconnect!');
    for (const key in users) {
      if (users[key] === socket.id) {
        key == 'admin' ? io.sockets.emit('admin-status', 'offline') : '';
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

  socket.on('client-untyping', (data) => {
    socket.to(users['admin']).emit('client-untyping', data)
  });
});

server.listen(port, () => {
  console.log(`http://localhost:${port}`);
});