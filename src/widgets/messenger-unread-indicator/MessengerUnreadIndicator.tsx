import { MessageCircleMore } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { useConversationsQuery } from '@/entities/messenger';
import { useMessengerCommands } from '@/features/send-message';
import type { RootState } from '@/app/providers/store';

const displayCount = (count: number) => (count > 99 ? '99+' : count);

/** Global authenticated-layout entry point for unread family chat messages. */
export const MessengerUnreadIndicator = () => {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const { data: conversations = [] } = useConversationsQuery();
  const connectionStatus = useSelector(
    (state: RootState) => state.messengerRealtime.connectionStatus,
  );
  const { joinConversation } = useMessengerCommands();
  const joinedConversationIdsRef = useRef(new Set<string>());
  const unreadCount = conversations.reduce(
    (total, conversation) => total + conversation.unreadCount,
    0,
  );

  useEffect(() => {
    if (connectionStatus !== 'online') {
      joinedConversationIdsRef.current.clear();
      return;
    }

    conversations.forEach((conversation) => {
      if (joinedConversationIdsRef.current.has(conversation.id)) return;
      joinedConversationIdsRef.current.add(conversation.id);
      joinConversation(conversation.id).catch(() => {
        joinedConversationIdsRef.current.delete(conversation.id);
      });
    });
  }, [connectionStatus, conversations, joinConversation]);

  return (
    <AnimatePresence>
      {unreadCount > 0 && (
        <motion.button
          aria-label={`Открыть сообщения: ${unreadCount} непрочитанных`}
          className="border-primary-neon/70 bg-surface/90 text-primary-neon absolute right-5 top-5 z-30 grid h-12 w-12 cursor-pointer place-items-center rounded-full border shadow-[0_0_24px_color-mix(in_srgb,var(--color-primary-neon)_42%,transparent)] backdrop-blur-xl transition-colors hover:border-cyber-cyan hover:text-cyber-cyan focus-visible:outline-2 focus-visible:outline-cyber-cyan focus-visible:outline-offset-4"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.82, y: -8 }}
          onClick={() => navigate('/my_family/messenger')}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, scale: 0.82, y: -8 }}
          transition={{ duration: reduceMotion ? 0 : 0.18 }}
          type="button"
        >
          <MessageCircleMore aria-hidden="true" className="h-5 w-5" />
          <span className="bg-neon-pink text-text absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full border-2 border-surface px-1 text-[10px] font-bold shadow-[0_0_16px_color-mix(in_srgb,var(--color-neon-pink)_70%,transparent)]">
            {displayCount(unreadCount)}
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
};
