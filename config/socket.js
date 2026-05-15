const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join a private room for the user
    socket.on('join-user-room', (userId) => {
      socket.join(userId);
      console.log(`User ${socket.id} joined their private room ${userId}`);
    });

    // Join a session room (for chat/whiteboard)
    socket.on('join-session', (sessionId) => {
      socket.join(sessionId);
      console.log(`User ${socket.id} joined session ${sessionId}`);
    });

    // Handle SOS broadcast (can be called from client or server)
    socket.on('send-sos', (data) => {
      socket.broadcast.emit('new-sos-request', data);
    });

    // Handle matching
    socket.on('accept-match', (data) => {
      // data: { requestId, helperId, requesterId }
      io.to(data.requesterId).emit('match-found', data);
    });

    // Chat functionality
    socket.on('send-message', (data) => {
      // data: { sessionId, message, senderId, timestamp }
      io.to(data.sessionId).emit('receive-message', data);
    });

    // Whiteboard functionality
    socket.on('draw', (data) => {
      // data: { sessionId, x, y, prevX, prevY, color, size }
      socket.to(data.sessionId).emit('draw', data);
    });

    socket.on('clear-whiteboard', (sessionId) => {
      io.to(sessionId).emit('clear-whiteboard');
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = { initSocket, getIO };
