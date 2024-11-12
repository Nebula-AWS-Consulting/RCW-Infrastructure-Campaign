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

interface Expense {
    expense_id: number,
    expense_name: string,
    expense_amount: number,
    expense_type: string,
    user_id: number,
    time_stamp: string
}

interface InitialState {
    user: User | null,
    token: string | null,
    expenses: Expense[],
    expense: Expense | null
}

const initialState: InitialState = {
    user: null,
    token: null,
    expenses: [],
    expense: null
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
            localStorage.removeItem('isUser')
            localStorage.removeItem('jwtToken')
        },
        setExpenses: (state: InitialState, action: PayloadAction<InitialState>) => {
            state.expenses = action.payload.expenses
        },
        addExpense: (state: InitialState, action: PayloadAction<InitialState>) => {
            state.expenses.push(action.payload.expense as Expense)
        }
    }
})

export const { setLogin, setLogout, setExpenses, addExpense } = userAuthAndInfoSlice.actions
export default userAuthAndInfoSlice.reducer