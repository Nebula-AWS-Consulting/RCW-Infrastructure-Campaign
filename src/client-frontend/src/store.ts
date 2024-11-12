import { configureStore } from "@reduxjs/toolkit";
import userAuthAndInfoReducer from "./modules/ducks/userSlice";


export const store = configureStore({
    reducer: {
        userAuthAndInfo: userAuthAndInfoReducer
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch