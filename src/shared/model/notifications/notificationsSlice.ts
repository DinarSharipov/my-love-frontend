import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { createId } from '@/shared/lib/id';

export type AppNotificationType = 'error' | 'info' | 'success' | 'warning';

export type AppNotification = {
  id: string;
  message: string;
  title: string;
  type: AppNotificationType;
};

export type AppNotificationInput = Omit<AppNotification, 'id'>;

type NotificationsState = {
  items: AppNotification[];
};

const initialState: NotificationsState = { items: [] };

const notificationsSlice = createSlice({
  initialState,
  name: 'notifications',
  reducers: {
    dismissNotification: (state, action: PayloadAction<string>) => ({
      ...state,
      items: state.items.filter((notification) => notification.id !== action.payload),
    }),
    showNotification: {
      prepare: (notification: AppNotificationInput) => ({
        payload: { ...notification, id: createId() },
      }),
      reducer: (state, action: PayloadAction<AppNotification>) => ({
        ...state,
        items: [action.payload, ...state.items].slice(0, 5),
      }),
    },
  },
});

export const { dismissNotification, showNotification } = notificationsSlice.actions;
export const notificationsReducer = notificationsSlice.reducer;
