import { CheckCircle2, Info, TriangleAlert, X, XCircle } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect } from 'react';

import type { AppNotification, AppNotificationType } from '@/shared/model/notifications';

type NotificationsProps = {
  items: readonly AppNotification[];
  onDismiss: (id: string) => void;
};

const notificationStyles: Record<AppNotificationType, { accent: string; Icon: typeof Info }> = {
  error: { accent: 'border-neon-pink/50 text-neon-pink', Icon: XCircle },
  info: { accent: 'border-cyber-cyan/50 text-cyber-cyan', Icon: Info },
  success: { accent: 'border-acid-green/50 text-acid-green', Icon: CheckCircle2 },
  warning: { accent: 'border-electric-purple/60 text-electric-purple', Icon: TriangleAlert },
};

const NotificationItem = ({
  notification,
  onDismiss,
}: {
  notification: AppNotification;
  onDismiss: (id: string) => void;
}) => {
  const prefersReducedMotion = useReducedMotion();
  const { Icon, accent } = notificationStyles[notification.type];

  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => onDismiss(notification.id),
      notification.type === 'error' ? 7000 : 5000,
    );
    return () => window.clearTimeout(timeoutId);
  }, [notification.id, notification.type, onDismiss]);

  return (
    <motion.li
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="border-border bg-surface/95 pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-[0_18px_42px_rgba(5,5,10,0.45)] backdrop-blur-xl"
      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -12 }}
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -16 }}
      layout
      transition={
        prefersReducedMotion ? { duration: 0.12 } : { bounce: 0.2, duration: 0.32, type: 'spring' }
      }
    >
      <Icon aria-hidden="true" className={`mt-0.5 size-5 shrink-0 ${accent}`} />
      <div className="min-w-0 flex-1">
        <p className="text-text text-sm font-semibold">{notification.title}</p>
        <p className="text-muted-text mt-1 text-sm">{notification.message}</p>
      </div>
      <motion.button
        aria-label="Закрыть уведомление"
        className="text-muted-text hover:text-text grid size-7 shrink-0 place-items-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-cyber-cyan"
        onClick={() => onDismiss(notification.id)}
        type="button"
        whileTap={prefersReducedMotion ? undefined : { scale: 0.86 }}
      >
        <X aria-hidden="true" className="size-4" />
      </motion.button>
    </motion.li>
  );
};

export const Notifications = ({ items, onDismiss }: NotificationsProps) => (
  <section
    aria-label="Системные уведомления"
    aria-live="polite"
    className="pointer-events-none fixed right-4 top-4 z-[100] w-[min(26rem,calc(100vw-2rem))] space-y-2"
  >
    <AnimatePresence initial={false} mode="popLayout">
      {items.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} onDismiss={onDismiss} />
      ))}
    </AnimatePresence>
  </section>
);
