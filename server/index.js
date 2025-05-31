const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const Poll = require('./models/Poll');

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Get allowed origins from environment variable or default to localhost
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ["http://localhost:3000"];

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

// Get all poll history
app.get('/api/polls', async (req, res) => {
  try {
    const polls = await Poll.find().sort({ endTime: -1 });
    res.json(polls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
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
const userSockets = new Map(); // Track user's socket IDs
const teachers = new Set(); // Track teacher sockets

// Debug function to log connected users
const logConnectedUsers = () => {
  console.log('Connected users:', Array.from(connectedUsers.entries()));
  console.log('Teachers:', Array.from(teachers));
};

io.on('connection', (socket) => {
  console.log('New client connected, socket ID:', socket.id);

  // Handle reconnection
  const { name, role } = socket.handshake.query;
  if (name && role) {
    console.log(`User reconnecting - Name: ${name}, Role: ${role}`);
    if (role === 'teacher') {
      socket.teacherName = name;
      socket.isTeacher = true;
      teachers.add(socket.id);
      if (activePoll.question) {
        socket.emit('poll:current', activePoll);
      }
    } else if (role === 'student') {
      socket.studentName = name;
      // Remove old socket ID if exists
      for (const [socketId, userName] of connectedUsers.entries()) {
        if (userName === name) {
          connectedUsers.delete(socketId);
          break;
        }
      }
      connectedUsers.set(socket.id, name);
      io.emit('users:update', Array.from(connectedUsers.values()));
      
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
    }
  }

  // Handle teacher joining
  socket.on('teacher:join', ({ name }) => {
    console.log(`Teacher joined: ${name}, socket ID: ${socket.id}`);
    socket.teacherName = name;
    socket.isTeacher = true;
    teachers.add(socket.id);
    
    // Send current poll and connected users to teacher
    if (activePoll.question) {
      console.log('Sending current poll to teacher');
      socket.emit('poll:current', activePoll);
    }
    socket.emit('users:update', Array.from(connectedUsers.values()));
  });

  // Handle student joining
  socket.on('student:join', ({ name }) => {
    console.log(`Student joined: ${name}, socket ID: ${socket.id}`);
    socket.studentName = name;
    
    // Remove old socket ID if exists
    for (const [socketId, userName] of connectedUsers.entries()) {
      if (userName === name) {
        connectedUsers.delete(socketId);
        break;
      }
    }
    
    connectedUsers.set(socket.id, name);
    io.emit('users:update', Array.from(connectedUsers.values()));
    logConnectedUsers();
    
    if (activePoll.question) {
      const now = Date.now();
      const elapsed = now - activePoll.startTime;
      if (elapsed < activePoll.duration) {
        console.log(`Sending current poll to student: ${name}`);
        socket.emit('poll:current', {
          ...activePoll,
          startTime: now - elapsed
        });
      }
    }
  });

  // Handle new poll creation
  socket.on('poll:create', async (pollData) => {
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
    io.emit('poll:new', activePoll);

    // Auto-close poll after duration
    setTimeout(async () => {
      if (activePoll.question === pollData.question) {
        console.log('Poll time ended, closing poll');
        
        // Save poll to MongoDB with complete data
        try {
          const poll = new Poll({
            question: activePoll.question,
            options: activePoll.options.map(opt => ({
              text: opt.text,
              isCorrect: opt.isCorrect
            })),
            results: activePoll.results,
            startTime: new Date(activePoll.startTime),
            endTime: new Date(activePoll.startTime + activePoll.duration),
            duration: activePoll.duration
          });
          
          const savedPoll = await poll.save();
          console.log('Poll saved to database:', savedPoll);
          
          // Clear active poll and broadcast end
          activePoll.question = null;
          io.emit('poll:end', activePoll.results);
        } catch (error) {
          console.error('Error saving poll:', error);
        }
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
        // Send system message about the kick
        const kickMessage = {
          sender: 'System',
          text: `${studentName} has been kicked from the session`,
          timestamp: Date.now(),
          isSystem: true
        };
        io.emit('chat:message', kickMessage);
        
        // Notify the kicked student to redirect
        io.to(studentSocketId).emit('student:kicked', studentName);
        
        // Remove the student from connected users
        connectedUsers.delete(studentSocketId);
        io.emit('users:update', Array.from(connectedUsers.values()));
        logConnectedUsers();
      }
    }
  });

  // Handle poll history request
  socket.on('poll:history', async () => {
    try {
      const polls = await Poll.find().sort({ endTime: -1 });
      socket.emit('poll:history', polls);
    } catch (error) {
      console.error('Error fetching poll history:', error);
      socket.emit('error', 'Failed to fetch poll history');
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected, socket ID:', socket.id);
    
    // Remove from teachers set if it was a teacher
    if (socket.isTeacher) {
      teachers.delete(socket.id);
    }
    
    // Handle student disconnection
    if (connectedUsers.has(socket.id)) {
      const userName = connectedUsers.get(socket.id);
      // Only remove user if they don't have another active socket
      let hasOtherSockets = false;
      for (const [otherSocketId, otherUserName] of connectedUsers.entries()) {
        if (otherSocketId !== socket.id && otherUserName === userName) {
          hasOtherSockets = true;
          break;
        }
      }
      if (!hasOtherSockets) {
        connectedUsers.delete(socket.id);
        io.emit('users:update', Array.from(connectedUsers.values()));
        logConnectedUsers();
      }
    }
  });
});

// API endpoint to fetch poll history
app.get('/api/polls/history', async (req, res) => {
  try {
    const polls = await Poll.find().sort({ startTime: -1 });
    res.json(polls);
  } catch (error) {
    console.error('Error fetching poll history:', error);
    res.status(500).json({ message: 'Error fetching poll history' });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log('\x1b[32m%s\x1b[0m', '🚀 Server Successfully Deployed and Running!');
  console.log('\x1b[36m%s\x1b[0m', `📡 Server is listening on port ${PORT}`);
  console.log('\x1b[36m%s\x1b[0m', `🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('\x1b[36m%s\x1b[0m', '✅ WebSocket connections are ready');
  console.log('\x1b[33m%s\x1b[0m', `💡 Allowed Origins: ${allowedOrigins.join(', ')}`);
}); 