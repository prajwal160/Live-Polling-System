import { createSlice } from '@reduxjs/toolkit';
import { enableMapSet } from 'immer';

// Enable MapSet support in Immer
enableMapSet();

const initialState = {
  currentPoll: null,
  results: {},
  timeRemaining: 0,
  connectedUsers: [],
  messages: [],
  kickedUsers: [], // Change from Set to Array for better Redux compatibility
};

const pollSlice = createSlice({
  name: 'poll',
  initialState,
  reducers: {
    setPoll: (state, action) => {
      state.currentPoll = action.payload;
      state.results = {};
      state.timeRemaining = action.payload.duration;
    },
    updateResults: (state, action) => {
      if (action.payload) {
        state.results = { ...action.payload };
        console.log('Updated results in store:', state.results);
      }
    },
    updateTimeRemaining: (state, action) => {
      state.timeRemaining = action.payload;
    },
    updateConnectedUsers: (state, action) => {
      state.connectedUsers = action.payload;
    },
    clearPoll: (state) => {
      state.currentPoll = null;
      state.results = {};
      state.timeRemaining = 0;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
      // If it's a kick message, update the kicked users array
      if (action.payload.isSystem && action.payload.text.includes('has been kicked')) {
        const kickedUser = action.payload.text.split(' ')[0];
        if (!state.kickedUsers.includes(kickedUser)) {
          state.kickedUsers.push(kickedUser);
        }
      }
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    addKickedUser: (state, action) => {
      if (!state.kickedUsers.includes(action.payload)) {
        state.kickedUsers.push(action.payload);
      }
    },
    removeKickedUser: (state, action) => {
      state.kickedUsers = state.kickedUsers.filter(user => user !== action.payload);
    },
  },
});

export const { 
  setPoll, 
  updateResults, 
  updateTimeRemaining, 
  updateConnectedUsers,
  clearPoll,
  addMessage,
  clearMessages,
  addKickedUser,
  removeKickedUser,
} = pollSlice.actions;

export default pollSlice.reducer; 