import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  name: '',
  role: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.name = action.payload.name;
      state.role = action.payload.role;
    },
    clearUser: (state) => {
      state.name = '';
      state.role = '';
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer; 