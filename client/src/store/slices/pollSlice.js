import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentPoll: null,
  results: {},
  timeRemaining: 0,
  connectedUsers: [],
  messages: [],
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
    },
    clearMessages: (state) => {
      state.messages = [];
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
} = pollSlice.actions;
export default pollSlice.reducer; 