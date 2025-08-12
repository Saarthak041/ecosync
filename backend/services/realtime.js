const { Server } = require('socket.io');

let io = null;

function init(server, corsOrigin = '*') {
  if (io) return io;
  io = new Server(server, {
    cors: { origin: corsOrigin, methods: ['GET', 'POST'] },
  });
  io.on('connection', (socket) => {
    // Optionally auth/rooms
    socket.emit('ready');
  });
  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}

function emitDeviceUpdate(device) {
  if (!io) return;
  io.emit('device:update', device);
}

module.exports = { init, getIO, emitDeviceUpdate };


