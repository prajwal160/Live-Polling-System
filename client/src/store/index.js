import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import pollReducer from './slices/pollSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    poll: pollReducer,
  },
});

export default store; 