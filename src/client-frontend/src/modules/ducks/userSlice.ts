import { createSlice } from '@reduxjs/toolkit';

export interface User {
  user_name: string;
  password: string | null;
  email: string;
}

interface InitialState {
  user: User | null;
  token: {
    id_token: string | null;
    access_token: string | null;
    refresh_token: string | null;
  };
}

const initialState: InitialState = {
  user: null,
  token: {
    id_token: null,
    access_token: null,
    refresh_token: null,
  },
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
  },
});

export const selectIsLoggedIn = (state: { userAuthAndInfo: InitialState }) => {
  return (
    !!state.userAuthAndInfo.user &&
    !!state.userAuthAndInfo.token.access_token
  );
};

export const { setLogin, setLogout } = userAuthAndInfoSlice.actions;
export default userAuthAndInfoSlice.reducer;
