import { Server } from 'socket.io';
import { io } from 'socket.io-client';
const express = require('express');
const next = require('next');
const http = require('http');
const { Server } = require('socket.io');
const socket = io('http://localhost:3000');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  const httpServer = http.createServer(server);
  const io = new Server(httpServer);

io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('connect_error', (err) => {
    console.error(`Connection Error: ${err.message}`);
  });

  socket.on('disconnect', (reason) => {
    console.log(`Client disconnected: ${reason}`);
  });

  socket.on('sendMessage', (message) => {
    console.log(`Message received: ${message}`);
    io.emit('receiveMessage', message);
  });
});


  server.all('*', (req, res) => {
    return handle(req, res);
  });

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
