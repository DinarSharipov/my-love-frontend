import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { AuthSession, User } from '@/entities/user/model/types';

export type UserState = {
  accessToken: string | null;
  expiresIn: number | null;
  tokenType: string | null;
  user: User | null;
};

const initialState: UserState = {
  accessToken: null,
  expiresIn: null,
  tokenType: null,
  user: null,
};

const userSlice = createSlice({
  initialState,
  name: 'user',
  reducers: {
    clearCredentials: () => initialState,
    setCredentials: (_, { payload }: PayloadAction<AuthSession>) => ({ ...payload }),
  },
});

export const { clearCredentials, setCredentials } = userSlice.actions;
export const userReducer = userSlice.reducer;

type StateWithUser = {
  user: UserState;
};

export const selectAccessToken = ({ user }: StateWithUser) => user.accessToken;
export const selectCurrentUser = ({ user }: StateWithUser) => user.user;
