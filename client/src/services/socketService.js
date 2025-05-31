import io from 'socket.io-client';
import store from '../store';
import {
  setPoll,
  updateResults,
  updateTimeRemaining,
  updateConnectedUsers,
  clearPoll,
  addMessage,
} from '../store/slices/pollSlice';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.activeTimer = null;
    this.isConnecting = false;
    this.maxRetries = 3;
    this.retryCount = 0;
    this.retryTimeout = null;
  }

  connect() {
    // Prevent multiple connection attempts
    if (this.isConnecting) {
      console.log('Connection already in progress...');
      return;
    }

    if (this.socket?.connected) {
      console.log('Already connected to server');
      return;
    }

    this.isConnecting = true;
    console.log('Connecting to server at:', SOCKET_URL);

    // Clear any existing socket
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    // Get stored user info from localStorage and Redux store
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const storeState = store.getState();
    const currentUser = storeState.user || {};

    // Use either stored or current user data
    const userData = {
      name: currentUser.name || storedUser.name,
      role: currentUser.role || storedUser.role
    };

    // Save current user data
    if (userData.name && userData.role) {
      localStorage.setItem('user', JSON.stringify(userData));
    }

    this.socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket'],
      forceNew: true,
      query: userData
    });

    this.socket.on('connect', () => {
      console.log('Connected to server with ID:', this.socket.id);
      this.isConnecting = false;
      this.retryCount = 0;
      
      // Rejoin as teacher or student based on stored role
      if (userData.role === 'teacher') {
        this.joinAsTeacher(userData.name);
      } else if (userData.role === 'student') {
        this.joinAsStudent(userData.name);
      }
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    if (!this.socket) {
      console.error('Cannot setup listeners: socket is null');
      return;
    }

    // Handle connection errors
    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.isConnecting = false;
      this.handleConnectionError();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      this.isConnecting = false;
      if (this.activeTimer) {
        clearInterval(this.activeTimer);
        this.activeTimer = null;
      }
    });

    // Handle new polls
    this.socket.on('poll:new', (poll) => {
      console.log('Received new poll event:', poll);
      this.handlePollUpdate(poll);
    });

    // Handle current poll state
    this.socket.on('poll:current', (poll) => {
      console.log('Received current poll:', poll);
      this.handlePollUpdate(poll);
    });

    // Handle poll results
    this.socket.on('poll:results', (results) => {
      console.log('Received poll results:', results);
      store.dispatch(updateResults(results));
    });

    // Handle poll end
    this.socket.on('poll:end', (results) => {
      console.log('Poll ended with results:', results);
      if (this.activeTimer) {
        clearInterval(this.activeTimer);
        this.activeTimer = null;
      }
      if (results) {
        store.dispatch(updateResults(results));
      }
      store.dispatch(clearPoll());
    });

    // Handle user updates
    this.socket.on('users:update', (users) => {
      console.log('Received users update:', users);
      store.dispatch(updateConnectedUsers(users));
    });

    // Handle chat messages
    this.socket.on('chat:message', (message) => {
      console.log('Received chat message:', message);
      store.dispatch(addMessage(message));
    });
  }

  handlePollUpdate(poll) {
    if (!poll || !poll.question) {
      console.error('Received invalid poll data:', poll);
      return;
    }

    // Clear any existing timer
    if (this.activeTimer) {
      clearInterval(this.activeTimer);
      this.activeTimer = null;
    }

    // Update the store with the new poll
    store.dispatch(setPoll(poll));
    
    if (poll.results) {
      store.dispatch(updateResults(poll.results));
    }

    // Calculate remaining time
    const startTime = poll.startTime || Date.now();
    const elapsed = Date.now() - startTime;
    const initialRemaining = poll.duration - elapsed;

    if (initialRemaining > 0) {
      store.dispatch(updateTimeRemaining(initialRemaining));
      
      // Start the timer
      this.activeTimer = setInterval(() => {
        const currentRemaining = poll.duration - (Date.now() - startTime);
        if (currentRemaining <= 0) {
          clearInterval(this.activeTimer);
          this.activeTimer = null;
          store.dispatch(clearPoll());
        } else {
          store.dispatch(updateTimeRemaining(currentRemaining));
        }
      }, 1000);
    } else {
      store.dispatch(clearPoll());
    }
  }

  handleConnectionError() {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      console.log(`Retrying connection (${this.retryCount}/${this.maxRetries})...`);
      if (this.retryTimeout) {
        clearTimeout(this.retryTimeout);
      }
      this.retryTimeout = setTimeout(() => {
        this.connect();
      }, 2000);
    } else {
      console.error('Max connection retries reached');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnecting = false;
      if (this.activeTimer) {
        clearInterval(this.activeTimer);
        this.activeTimer = null;
      }
      if (this.retryTimeout) {
        clearTimeout(this.retryTimeout);
        this.retryTimeout = null;
      }
      this.retryCount = 0;
    }
  }

  joinAsTeacher(name) {
    if (!this.socket?.connected) {
      console.error('Cannot join: socket not connected');
      return;
    }
    this.socket.emit('teacher:join', { name });
  }

  joinAsStudent(name) {
    if (!this.socket?.connected) {
      console.error('Cannot join: socket not connected');
      return;
    }
    this.socket.emit('student:join', { name });
  }

  createPoll(pollData) {
    if (this.socket?.connected) {
      console.log('Creating poll with data:', pollData);
      // Format the poll data properly
      const formattedPollData = {
        ...pollData,
        duration: pollData.duration || 60000,
        options: pollData.options.map(opt => ({
          text: opt.text.trim(),
          isCorrect: opt.isCorrect
        })).filter(opt => opt.text)
      };
      this.socket.emit('poll:create', formattedPollData);
      console.log('Poll creation request sent:', formattedPollData);
    } else {
      console.error('Socket not connected, current socket state:', {
        socket: this.socket ? 'exists' : 'null',
        connected: this.socket?.connected,
        id: this.socket?.id
      });
      this.connect();
      if (this.retryCount < this.maxRetries) {
        console.log(`Will retry poll creation in 2 seconds (attempt ${this.retryCount + 1}/${this.maxRetries})`);
        setTimeout(() => this.createPoll(pollData), 2000);
      }
    }
  }

  submitAnswer(answer) {
    if (this.socket?.connected) {
      console.log('Submitting answer:', answer);
      this.socket.emit('poll:answer', answer);
    } else {
      console.error('Socket not connected');
      this.connect();
      if (this.retryCount < this.maxRetries) {
        setTimeout(() => this.submitAnswer(answer), 2000);
      }
    }
  }

  sendMessage(message) {
    if (this.socket?.connected) {
      this.socket.emit('chat:message', message);
    }
  }

  kickStudent(studentName) {
    if (this.socket?.connected) {
      console.log('Kicking student:', studentName);
      this.socket.emit('student:kick', studentName);
    } else {
      console.error('Socket not connected');
      this.connect();
      if (this.retryCount < this.maxRetries) {
        setTimeout(() => this.kickStudent(studentName), 2000);
      }
    }
  }
}

const socketService = new SocketService();
export default socketService; 