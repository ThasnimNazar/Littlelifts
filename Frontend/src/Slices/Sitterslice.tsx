import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SitterInfo {
  _id:string;
  name: string;
  email: string;
  phoneno: number;
  gender: string;
  maxchildren:number;
  about:string;
  workwithpet:'yes' | 'no';
  yearofexperience:number;
  servicepay:number;
  childcategory:string[];
  selectedSittingOption:string
  weekendSlots:string[];
  regularSlots:string[];
  occasionalSlots:string[];
  specialCareSlots:string[];
  profileImage:string;
  verified:boolean;
  blocked:boolean
}

interface SitterAuthState {
  sitterInfo: SitterInfo | null;
 
}

const initialState: SitterAuthState = {
  sitterInfo: localStorage.getItem('sitterInfo')
    ? JSON.parse(localStorage.getItem('sitterInfo')!)
    : null, 
};

const sitterAuthSlice = createSlice({
  name: 'sitterAuth',
  initialState,
  reducers: {
    setSitterCredentials(state, action: PayloadAction<SitterInfo>) {
      console.log('setSitterCredentials action payload:');
      state.sitterInfo = action.payload;
      console.log(state.sitterInfo,'sitter')
      localStorage.setItem('sitterInfo', JSON.stringify(action.payload));
    },
    sitterLogout(state) {
      state.sitterInfo = null;
      localStorage.removeItem('sitterInfo');
    },
  },
});

export const { setSitterCredentials, sitterLogout } = sitterAuthSlice.actions;

export default sitterAuthSlice.reducer;
