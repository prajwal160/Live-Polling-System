const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ["http://localhost:3000"],
    methods: ["GET", "POST"]
  }
});

// Store active polls and connected users
const activePoll = {
  question: null,
  options: [],
  results: {},
  startTime: null,
  duration: 60000
};

const connectedUsers = new Map();
const pollHistory = [];

const logConnectedUsers = () => {
  console.log('Connected users:', Array.from(connectedUsers.entries()));
};

io.on('connection', (socket) => {
  console.log('New client connected, socket ID:', socket.id);

  socket.on('teacher:join', (teacherName) => {
    console.log(`Teacher joined: ${teacherName}, socket ID: ${socket.id}`);
    socket.teacherName = teacherName;
    socket.isTeacher = true;
    if (activePoll.question) {
      socket.emit('poll:current', activePoll);
    }
  });

  socket.on('student:join', (studentName) => {
    console.log(`Student joined: ${studentName}, socket ID: ${socket.id}`);
    socket.studentName = studentName;
    connectedUsers.set(socket.id, studentName);
    io.emit('users:update', Array.from(connectedUsers.values()));
    logConnectedUsers();
    
    if (activePoll.question) {
      const now = Date.now();
      const elapsed = now - activePoll.startTime;
      if (elapsed < activePoll.duration) {
        socket.emit('poll:current', {
          ...activePoll,
          startTime: now - elapsed
        });
      }
    }
  });

  socket.on('poll:create', (pollData) => {
    if (!socket.isTeacher) return;
    
    const now = Date.now();
    activePoll.question = pollData.question;
    activePoll.options = pollData.options;
    activePoll.results = {};
    activePoll.startTime = now;
    activePoll.duration = pollData.duration;

    io.emit('poll:new', activePoll);

    setTimeout(() => {
      if (activePoll.question === pollData.question) {
        pollHistory.push({ ...activePoll, endTime: Date.now() });
        activePoll.question = null;
        io.emit('poll:end', activePoll.results);
      }
    }, pollData.duration);
  });

  socket.on('poll:answer', (answer) => {
    if (socket.studentName && activePoll.question) {
      const now = Date.now();
      const elapsed = now - activePoll.startTime;
      
      if (elapsed < activePoll.duration) {
        activePoll.results[socket.studentName] = answer;
        io.emit('poll:results', activePoll.results);
      }
    }
  });

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

  socket.on('poll:history', () => {
    if (socket.isTeacher) {
      socket.emit('poll:history', pollHistory);
    }
  });

  socket.on('disconnect', () => {
    if (!socket.isTeacher) {
      connectedUsers.delete(socket.id);
      io.emit('users:update', Array.from(connectedUsers.values()));
    }
    console.log(`Client disconnected: ${socket.id}`);
    logConnectedUsers();
  });
});

// Health check endpoint
app.get('/api', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = server; 