import { configureStore } from '@reduxjs/toolkit';
import type { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { userReducer } from '@/entities/user';
import { messengerRealtimeReducer } from '@/features/messenger-realtime';
import { baseApi } from '@/shared/api';
import { notificationsReducer } from '@/shared/model/notifications';
import { authMiddleware } from '@/app/providers/store/authMiddleware';
import { apiErrorNotificationMiddleware } from '@/app/providers/store/apiErrorNotificationMiddleware';

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    messengerRealtime: messengerRealtimeReducer,
    notifications: notificationsReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authMiddleware,
      apiErrorNotificationMiddleware,
      baseApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const AppStoreProvider = ({ children }: PropsWithChildren) => (
  <Provider store={store}>{children}</Provider>
);
