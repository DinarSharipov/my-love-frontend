import { io, type Socket } from 'socket.io-client';

import type { CreateMessageDto } from '@/shared/api';

import type { MessengerConversation, MessengerMessage } from '@/entities/messenger';

export type CommandError = { code: string; message: string };
export type CommandResponse<T = undefined> =
  | { ok: true; requestId: string; message?: T; conversationId?: string }
  | { ok: false; requestId: string | null; error: CommandError };
type ConversationCommand = { conversationId: string; requestId: string };
type MessageCommand = ConversationCommand & { messageId: string };
type SendMessageCommand = ConversationCommand & {
  message: CreateMessageDto;
};

type ServerToClientEvents = {
  'conversation.created': (conversation: MessengerConversation) => void;
  'conversation.updated': (conversation: MessengerConversation) => void;
  'message.created': (message: MessengerMessage) => void;
  'message.updated': (message: MessengerMessage) => void;
  'message.deleted': (message: MessengerMessage) => void;
  'message.read': (payload: MessageCommand & { readAt: string | null; userId: string }) => void;
  'presence.updated': (
    payload: ConversationCommand & { status: 'online' | 'offline'; userId: string },
  ) => void;
  'typing.updated': (payload: ConversationCommand & { isTyping: boolean; userId: string }) => void;
};
type ClientToServerEvents = {
  'conversation.join': (
    payload: ConversationCommand,
    ack: (response: CommandResponse) => void,
  ) => void;
  'conversation.leave': (
    payload: ConversationCommand,
    ack: (response: CommandResponse) => void,
  ) => void;
  'typing.start': (payload: ConversationCommand, ack: (response: CommandResponse) => void) => void;
  'typing.stop': (payload: ConversationCommand, ack: (response: CommandResponse) => void) => void;
  'message.send': (
    payload: SendMessageCommand,
    ack: (response: CommandResponse<MessengerMessage>) => void,
  ) => void;
  'message.read': (payload: MessageCommand, ack: (response: CommandResponse) => void) => void;
  'message.edit': (
    payload: MessageCommand & { text: string },
    ack: (response: CommandResponse<MessengerMessage>) => void,
  ) => void;
  'message.delete': (
    payload: MessageCommand,
    ack: (response: CommandResponse<MessengerMessage>) => void,
  ) => void;
};

export type MessengerSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: MessengerSocket | null = null;

export const connectMessengerSocket = (token: string): MessengerSocket => {
  if (!socket) {
    socket = io('/messenger', {
      autoConnect: false,
      auth: { token },
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });
  }
  const previousToken = (socket.auth as { token?: string }).token;
  if (socket.connected && previousToken && previousToken !== token) socket.disconnect();
  socket.auth = { token };
  if (!socket.connected) socket.connect();
  return socket;
};

export const getMessengerSocket = () => socket;

export const emitMessengerCommand = <T>(
  event: keyof ClientToServerEvents,
  payload: Record<string, unknown>,
): Promise<CommandResponse<T>> => {
  const activeSocket = getMessengerSocket();
  if (!activeSocket?.connected) {
    return Promise.resolve({
      error: { code: 'OFFLINE', message: 'Соединение с чатом не установлено' },
      ok: false,
      requestId: typeof payload.requestId === 'string' ? payload.requestId : null,
    });
  }

  return new Promise((resolve) => {
    const timeout = window.setTimeout(() => {
      resolve({
        error: { code: 'TIMEOUT', message: 'Сервер чата не ответил вовремя' },
        ok: false,
        requestId: typeof payload.requestId === 'string' ? payload.requestId : null,
      });
    }, 10_000);
    (
      activeSocket as unknown as {
        emit: (name: string, body: unknown, ack: (value: CommandResponse<T>) => void) => void;
      }
    ).emit(event, payload, (response) => {
      window.clearTimeout(timeout);
      resolve(response);
    });
  });
};

export const disconnectMessengerSocket = () => {
  socket?.disconnect();
  socket = null;
};
