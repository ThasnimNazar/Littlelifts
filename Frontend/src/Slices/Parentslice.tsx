import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ParentInfo {
    _id:string;
    name: string;
    email: string;
    phoneno: string;
    categoryofchild: string;
    blocked:boolean;
}

interface ParentAuthState {
    parentInfo: ParentInfo | null;
    userType: string | null;
}

const initialState: ParentAuthState = {
    parentInfo: localStorage.getItem('parentInfo') ? JSON.parse(localStorage.getItem('parentInfo')!) : null,
    userType: localStorage.getItem('userType') || null
};

const parentAuthSlice = createSlice({
    name: 'parentAuth',
    initialState,
    reducers: {
        setParentCredentials: (state, action: PayloadAction<ParentInfo>) => {
            state.parentInfo = action.payload;
            state.userType = 'parent';
            localStorage.setItem('userType', 'parent');
            localStorage.setItem('parentInfo', JSON.stringify(action.payload));
        },
        parentLogout: (state) => {
            state.parentInfo = null;
            state.userType = null;
            localStorage.removeItem('userType');
            localStorage.removeItem('parentInfo');
        }
    }
});

export const { setParentCredentials, parentLogout } = parentAuthSlice.actions;

export default parentAuthSlice.reducer;
