import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { z } from 'zod';

import { selectAccessToken } from '@/entities/user';
import {
  connectMessengerSocket,
  disconnectMessengerSocket,
  resetMessengerRealtime,
  setConnectionStatus,
  setPresence,
  setTyping,
} from '@/features/messenger-realtime';
import { baseApi } from '@/shared/api';
import type { AppDispatch, RootState } from '@/app/providers/store';

const conversationSchema = z.object({ id: z.string().uuid() }).passthrough();
const messageSchema = z
  .object({ conversationId: z.string().uuid(), id: z.string().uuid() })
  .passthrough();
const presenceSchema = z.object({
  conversationId: z.string().uuid(),
  status: z.enum(['online', 'offline']),
  userId: z.string().uuid(),
});
const typingSchema = z.object({
  conversationId: z.string().uuid(),
  isTyping: z.boolean(),
  userId: z.string().uuid(),
});

/** Owns the single Socket.IO connection; screens only consume typed commands and RTK Query. */
export const MessengerRealtimeProvider = ({ children }: PropsWithChildren) => {
  const accessToken = useSelector((state: RootState) => selectAccessToken(state));
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!accessToken) {
      disconnectMessengerSocket();
      dispatch(resetMessengerRealtime());
      return undefined;
    }

    const socket = connectMessengerSocket(accessToken);
    const invalidateMessenger = () => dispatch(baseApi.util.invalidateTags(['messenger']));
    const onConnect = () => dispatch(setConnectionStatus('online'));
    const onConnectError = () => dispatch(setConnectionStatus('offline'));
    const onDisconnect = () => dispatch(setConnectionStatus('offline'));
    const onReconnectAttempt = () => dispatch(setConnectionStatus('reconnecting'));
    const onConversation = (payload: unknown) => {
      if (conversationSchema.safeParse(payload).success) invalidateMessenger();
    };
    const onMessage = (payload: unknown) => {
      if (messageSchema.safeParse(payload).success) invalidateMessenger();
    };
    const onPresence = (payload: unknown) => {
      const parsed = presenceSchema.safeParse(payload);
      if (parsed.success) dispatch(setPresence(parsed.data));
    };
    const onTyping = (payload: unknown) => {
      const parsed = typingSchema.safeParse(payload);
      if (parsed.success) dispatch(setTyping(parsed.data));
    };

    dispatch(setConnectionStatus(socket.connected ? 'online' : 'connecting'));
    socket.on('connect', onConnect);
    socket.on('connect_error', onConnectError);
    socket.on('disconnect', onDisconnect);
    socket.io.on('reconnect_attempt', onReconnectAttempt);
    socket.on('conversation.created', onConversation);
    socket.on('conversation.updated', onConversation);
    socket.on('message.created', onMessage);
    socket.on('message.updated', onMessage);
    socket.on('message.deleted', onMessage);
    socket.on('message.read', onMessage);
    socket.on('presence.updated', onPresence);
    socket.on('typing.updated', onTyping);

    return () => {
      socket.off('connect', onConnect);
      socket.off('connect_error', onConnectError);
      socket.off('disconnect', onDisconnect);
      socket.io.off('reconnect_attempt', onReconnectAttempt);
      socket.off('conversation.created', onConversation);
      socket.off('conversation.updated', onConversation);
      socket.off('message.created', onMessage);
      socket.off('message.updated', onMessage);
      socket.off('message.deleted', onMessage);
      socket.off('message.read', onMessage);
      socket.off('presence.updated', onPresence);
      socket.off('typing.updated', onTyping);
    };
  }, [accessToken, dispatch]);

  return children;
};
