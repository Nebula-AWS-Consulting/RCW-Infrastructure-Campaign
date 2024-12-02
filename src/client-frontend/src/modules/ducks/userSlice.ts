import { createSlice } from '@reduxjs/toolkit';

export interface User {
  user_name: string;
  email: string;
}

interface InitialState {
  user: User | null;
  token: {
    id_token: string | null;
    access_token: string | null;
    refresh_token: string | null;
  };
  language: string;
}

const initialState: InitialState = {
  user: null,
  token: {
    id_token: null,
    access_token: null,
    refresh_token: null,
  },
  language: localStorage.getItem('language') || 'en-US'
};

export const userAuthAndInfoSlice = createSlice({
  name: 'userAuth',
  initialState,
  reducers: {
    setLogin: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    setLogout: (state) => {
      state.user = null;
      state.token = {
        id_token: null,
        access_token: null,
        refresh_token: null,
      };
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
      localStorage.setItem('language', action.payload);
    },
  },
});

export const selectIsLoggedIn = (state: { userAuthAndInfo: InitialState }) => {
  return (
    !!state.userAuthAndInfo.user &&
    !!state.userAuthAndInfo.token.access_token
  );
};

export const selectLanguage = (state: { userAuthAndInfo: InitialState }) =>
  state.userAuthAndInfo.language;

export const { setLogin, setLogout, setLanguage } = userAuthAndInfoSlice.actions;
export default userAuthAndInfoSlice.reducer;