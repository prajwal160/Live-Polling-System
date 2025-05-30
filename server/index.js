const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Get allowed origins from environment variable or default to localhost
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ["http://localhost:3001"];

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: allowedOrigins
}));
app.use(express.json());

// Test route to verify server is running
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Server Status</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f0f2f5;
          }
          .container {
            text-align: center;
            padding: 2rem;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          h1 {
            color: #28a745;
            margin-bottom: 1rem;
          }
          p {
            color: #666;
            margin: 0.5rem 0;
          }
          .status {
            font-size: 1.2rem;
            color: #0066cc;
            margin-top: 1rem;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 Server is Running!</h1>
          <p>The WebSocket server is active and ready for connections.</p>
          <p class="status">Status: Online</p>
          <p>Environment: ${process.env.NODE_ENV || 'development'}</p>
        </div>
      </body>
    </html>
  `);
});

// Store active polls and connected users
const activePoll = {
  question: null,
  options: [],
  results: {},
  startTime: null,
  duration: 60000 // default 60 seconds
};

const connectedUsers = new Map();
const pollHistory = [];

// Debug function to log connected users
const logConnectedUsers = () => {
  console.log('Connected users:', Array.from(connectedUsers.entries()));
};

io.on('connection', (socket) => {
  console.log('New client connected, socket ID:', socket.id);

  // Handle teacher joining
  socket.on('teacher:join', (teacherName) => {
    console.log(`Teacher joined: ${teacherName}, socket ID: ${socket.id}`);
    socket.teacherName = teacherName;
    socket.isTeacher = true;
    if (activePoll.question) {
      console.log('Sending current poll to teacher');
      socket.emit('poll:current', activePoll);
    }
  });

  // Handle student joining
  socket.on('student:join', (studentName) => {
    console.log(`Student joined: ${studentName}, socket ID: ${socket.id}`);
    socket.studentName = studentName;
    connectedUsers.set(socket.id, studentName);
    io.emit('users:update', Array.from(connectedUsers.values()));
    logConnectedUsers();
    
    // Send current poll if exists
    if (activePoll.question) {
      const now = Date.now();
      const elapsed = now - activePoll.startTime;
      if (elapsed < activePoll.duration) {
        console.log(`Sending current poll to student: ${studentName}`);
        socket.emit('poll:current', {
          ...activePoll,
          startTime: now - elapsed
        });
      }
    }
  });

  // Handle new poll creation
  socket.on('poll:create', (pollData) => {
    console.log('Received poll creation request:', pollData);
    
    if (!socket.isTeacher) {
      console.log('Poll creation rejected: User is not a teacher');
      return;
    }
    
    // Update active poll
    const now = Date.now();
    activePoll.question = pollData.question;
    activePoll.options = pollData.options;
    activePoll.results = {};
    activePoll.startTime = now;
    activePoll.duration = pollData.duration;

    console.log('Broadcasting new poll to all clients:', activePoll);
    console.log('Connected clients:', io.engine.clientsCount);
    console.log('Connected sockets:', Array.from(io.sockets.sockets.keys()));
    
    // Broadcast to everyone
    io.emit('poll:new', activePoll);
    console.log('Poll broadcast completed');

    // Auto-close poll after duration
    setTimeout(() => {
      if (activePoll.question === pollData.question) {
        console.log('Poll time ended, closing poll');
        pollHistory.push({ ...activePoll, endTime: Date.now() });
        activePoll.question = null;
        io.emit('poll:end', activePoll.results);
      }
    }, pollData.duration);
  });

  // Handle student answer
  socket.on('poll:answer', (answer) => {
    console.log(`Received answer from ${socket.studentName}:`, answer);
    if (socket.studentName && activePoll.question) {
      const now = Date.now();
      const elapsed = now - activePoll.startTime;
      
      // Only accept answers if poll is still active
      if (elapsed < activePoll.duration) {
        activePoll.results[socket.studentName] = answer;
        console.log('Broadcasting updated results:', activePoll.results);
        io.emit('poll:results', activePoll.results);
      } else {
        console.log('Answer rejected: poll has ended');
      }
    }
  });

  // Handle chat messages
  socket.on('chat:message', (message) => {
    const sender = socket.isTeacher ? socket.teacherName : socket.studentName;
    if (sender) {
      const messageData = {
        sender,
        text: message,
        timestamp: Date.now(),
      };
      io.emit('chat:message', messageData);
    }
  });

  // Handle student kick
  socket.on('student:kick', (studentName) => {
    if (socket.isTeacher) {
      const studentSocketId = Array.from(connectedUsers.entries())
        .find(([_, name]) => name === studentName)?.[0];
      
      if (studentSocketId) {
        io.to(studentSocketId).emit('student:kicked');
        connectedUsers.delete(studentSocketId);
        io.emit('users:update', Array.from(connectedUsers.values()));
        logConnectedUsers();
      }
    }
  });

  // Handle poll history request
  socket.on('poll:history', () => {
    if (socket.isTeacher) {
      socket.emit('poll:history', pollHistory);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (!socket.isTeacher) {
      connectedUsers.delete(socket.id);
      io.emit('users:update', Array.from(connectedUsers.values()));
    }
    console.log(`Client disconnected: ${socket.id}`);
    logConnectedUsers();
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log('\x1b[32m%s\x1b[0m', '🚀 Server Successfully Deployed and Running!');
  console.log('\x1b[36m%s\x1b[0m', `📡 Server is listening on port ${PORT}`);
  console.log('\x1b[36m%s\x1b[0m', `🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('\x1b[36m%s\x1b[0m', '✅ WebSocket connections are ready');
  console.log('\x1b[33m%s\x1b[0m', `💡 Allowed Origins: ${allowedOrigins.join(', ')}`);
}); 