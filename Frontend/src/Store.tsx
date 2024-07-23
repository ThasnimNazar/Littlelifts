import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./Slices/Apislice";

import sitterAuthReducer from './Slices/Sitterslice'
import parentAuthReducer from './Slices/Parentslice'
import Adminslice from "./Slices/Adminslice";

const store = configureStore({
    reducer: {
        sitterAuth: sitterAuthReducer,
        parentAuth: parentAuthReducer,
        adminAuth: Adminslice,
        [apiSlice.reducerPath]: apiSlice.reducer // Use apiSlice.reducerPath as the key
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(apiSlice.middleware), // Put custom middleware after default middleware
    devTools: true
});


export type RootState = ReturnType<typeof store.getState>
//this store have a method called getstate and this will get the entire state of the store using the typeof we can
//get the type of the state in the store
export type AppDispatch = typeof store.dispatch
//it will infer the dispatch type of the store

export default store;
