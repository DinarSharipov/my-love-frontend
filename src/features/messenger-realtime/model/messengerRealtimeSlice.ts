import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type MessengerConnectionStatus = 'connecting' | 'online' | 'reconnecting' | 'offline';
type MessengerRealtimeState = {
  connectionStatus: MessengerConnectionStatus;
  presenceByConversation: Record<string, Record<string, 'online' | 'offline'>>;
  typingByConversation: Record<string, string[]>;
};

const initialState: MessengerRealtimeState = {
  connectionStatus: 'offline',
  presenceByConversation: {},
  typingByConversation: {},
};

const messengerRealtimeSlice = createSlice({
  initialState,
  name: 'messengerRealtime',
  reducers: {
    resetMessengerRealtime: () => initialState,
    setConnectionStatus: (state, { payload }: PayloadAction<MessengerConnectionStatus>) => ({
      ...state,
      connectionStatus: payload,
    }),
    setPresence: (
      state,
      {
        payload,
      }: PayloadAction<{ conversationId: string; status: 'online' | 'offline'; userId: string }>,
    ) => ({
      ...state,
      presenceByConversation: {
        ...state.presenceByConversation,
        [payload.conversationId]: {
          ...state.presenceByConversation[payload.conversationId],
          [payload.userId]: payload.status,
        },
      },
    }),
    setTyping: (
      state,
      { payload }: PayloadAction<{ conversationId: string; isTyping: boolean; userId: string }>,
    ) => {
      const users = state.typingByConversation[payload.conversationId] ?? [];
      return {
        ...state,
        typingByConversation: {
          ...state.typingByConversation,
          [payload.conversationId]: payload.isTyping
            ? [...new Set([...users, payload.userId])]
            : users.filter((userId) => userId !== payload.userId),
        },
      };
    },
  },
});

export const { resetMessengerRealtime, setConnectionStatus, setPresence, setTyping } =
  messengerRealtimeSlice.actions;
export const messengerRealtimeReducer = messengerRealtimeSlice.reducer;
