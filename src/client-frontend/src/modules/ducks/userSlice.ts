import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface User {
    user_id: number,
    user_name: string,
    password: string,
    email: string,
    budget: number,
    time_stamp: string
}

interface InitialState {
    user: User | null,
    token: string | null
}

const initialState: InitialState = {
    user: null,
    token: null
}

export const userAuthAndInfoSlice = createSlice({
    name: 'userAuth',
    initialState,
    reducers: {
        setLogin: (state: InitialState, action: PayloadAction<InitialState>) => {
            state.user = action.payload.user
            state.token = action.payload.token
        },
        setLogout: (state: InitialState) => {
            state.user = null
            state.token = null
        }
    }
})

export const { setLogin, setLogout } = userAuthAndInfoSlice.actions
export default userAuthAndInfoSlice.reducer