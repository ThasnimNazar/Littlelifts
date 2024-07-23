import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ObjectId } from 'mongoose';

interface AdminInfo {
  _id: ObjectId;  
  name: string;
  email: string;
}

interface AdminState {
  adminInfo: AdminInfo | null;
}

const initialState: AdminState = {
  adminInfo: localStorage.getItem('adminInfo') ? JSON.parse(localStorage.getItem('adminInfo') as string) : null,
};

const adminSlice = createSlice({
  name: 'adminAuth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AdminInfo>) => {
      state.adminInfo = action.payload;
      localStorage.setItem('adminInfo', JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.adminInfo = null;
      localStorage.removeItem('adminInfo');
    },
  },
});

export const { setCredentials, logout } = adminSlice.actions;
export default adminSlice.reducer;
