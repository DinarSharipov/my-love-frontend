import type { MessengerConversation, MessengerMessage } from '../model/types';

export type MessageReadStatus = {
  readByCount: number;
  readerNames: string[];
  recipientCount: number;
};

const memberName = (member: MessengerConversation['members'][number]) =>
  [member.user.firstName, member.user.lastName].filter(Boolean).join(' ');

/**
 * Backend stores the latest message read by each participant. A message is read
 * when that marker is at or after the message creation time.
 */
export const getMessageReadStatus = (
  conversation: MessengerConversation,
  message: MessengerMessage,
): MessageReadStatus => {
  const recipients = conversation.members.filter((member) => member.userId !== message.senderId);
  const messageCreatedAt = Date.parse(message.createdAt);
  const readers = recipients.filter((member) => {
    if (!member.lastReadAt || Number.isNaN(messageCreatedAt)) return false;
    return Date.parse(member.lastReadAt) >= messageCreatedAt;
  });

  return {
    readByCount: readers.length,
    readerNames: readers.map(memberName).filter(Boolean),
    recipientCount: recipients.length,
  };
};
