import { configureStore } from '@reduxjs/toolkit';
import type { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { userReducer } from '@/entities/user';
import { baseApi } from '@/shared/api';
import { authMiddleware } from '@/app/providers/store/authMiddleware';

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authMiddleware, baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const AppStoreProvider = ({ children }: PropsWithChildren) => (
  <Provider store={store}>{children}</Provider>
);
