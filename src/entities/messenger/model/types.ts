import type {
  ConversationResponseDto,
  MessagePageResponseDto,
  MessageResponseDto,
} from '@/shared/api';

export type MessengerConversation = ConversationResponseDto;
export type MessengerMessage = MessageResponseDto;
export type MessengerMessagePage = MessagePageResponseDto;

export const asText = (value: unknown): string => (typeof value === 'string' ? value : '');
export const asUrl = (value: unknown): string | null => (typeof value === 'string' ? value : null);

export const participantName = (participant: { firstName: string; lastName: string }) =>
  [participant.firstName, participant.lastName].filter(Boolean).join(' ');
