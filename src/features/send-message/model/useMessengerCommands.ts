import { useCallback } from 'react';

import type { MessengerMessage } from '@/entities/messenger';
import { emitMessengerCommand } from '@/features/messenger-realtime';
import type { CreateMessageDto } from '@/shared/api';

const requestId = () => crypto.randomUUID();

export const useMessengerCommands = () => {
  const joinConversation = useCallback(
    (conversationId: string) =>
      emitMessengerCommand('conversation.join', { conversationId, requestId: requestId() }),
    [],
  );
  const leaveConversation = useCallback(
    (conversationId: string) =>
      emitMessengerCommand('conversation.leave', { conversationId, requestId: requestId() }),
    [],
  );
  const setTyping = useCallback(
    (conversationId: string, isTyping: boolean) =>
      emitMessengerCommand(isTyping ? 'typing.start' : 'typing.stop', {
        conversationId,
        requestId: requestId(),
      }),
    [],
  );
  const sendMessage = useCallback(
    (conversationId: string, message: CreateMessageDto) =>
      emitMessengerCommand<MessengerMessage>('message.send', {
        conversationId,
        message,
        requestId: requestId(),
      }),
    [],
  );
  const sendText = useCallback(
    (conversationId: string, text: string, clientMessageId: string = crypto.randomUUID()) =>
      sendMessage(conversationId, { clientMessageId, text, type: 'TEXT' }),
    [sendMessage],
  );
  const editMessage = useCallback(
    (conversationId: string, messageId: string, text: string) =>
      emitMessengerCommand<MessengerMessage>('message.edit', {
        conversationId,
        messageId,
        requestId: requestId(),
        text,
      }),
    [],
  );
  const deleteMessage = useCallback(
    (conversationId: string, messageId: string) =>
      emitMessengerCommand<MessengerMessage>('message.delete', {
        conversationId,
        messageId,
        requestId: requestId(),
      }),
    [],
  );

  return {
    deleteMessage,
    editMessage,
    joinConversation,
    leaveConversation,
    sendMessage,
    sendText,
    setTyping,
  };
};
