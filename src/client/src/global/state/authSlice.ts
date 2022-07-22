import { createSlice, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../../types";

type AuthState = {
  user: User | null;
  token: string | null;
};

const _setAuthenticatedUser: CaseReducer<
  AuthState,
  PayloadAction<{ user: User; token: string }>
> = (state, { payload: { user, token } }) => {
  state.user = user;
  state.token = token;
};

const _clearAuthenticatedUser: CaseReducer<AuthState> = (state) => {
  state.user = null;
  state.token = null;
};

const slice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null,
  } as AuthState,
  reducers: {
    setAuthenticatedUser: _setAuthenticatedUser,
    clearAuthenticatedUser: _clearAuthenticatedUser,
  },
});

export const { setAuthenticatedUser, clearAuthenticatedUser } = slice.actions;

export default slice.reducer;
