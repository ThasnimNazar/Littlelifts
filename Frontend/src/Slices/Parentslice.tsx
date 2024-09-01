import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ParentInfo {
    _id:string;
    name: string;
    email: string;
    phoneno: string;
    selectedchildcategory: string;
}

interface ParentAuthState {
    parentInfo: ParentInfo | null;
}

const initialState: ParentAuthState = {
    parentInfo: localStorage.getItem('parentInfo') ? JSON.parse(localStorage.getItem('parentInfo')!) : null,
};

const parentAuthSlice = createSlice({
    name: 'parentAuth',
    initialState,
    reducers: {
        setParentCredentials: (state, action: PayloadAction<ParentInfo>) => {
            state.parentInfo = action.payload;
            localStorage.setItem('parentInfo', JSON.stringify(action.payload));
        },
        parentLogout: (state) => {
            state.parentInfo = null;
            localStorage.removeItem('userType');
            localStorage.removeItem('parentInfo');
        }
    }
});

export const { setParentCredentials, parentLogout } = parentAuthSlice.actions;

export default parentAuthSlice.reducer;
