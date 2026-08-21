import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import {
  AlertCircle,
  Bell,
  CalendarDays,
  ChevronRight,
  Clock3,
  Heart,
  ListChecks,
  MailCheck,
  Plus,
  ShoppingBasket,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import type { Notification } from '@/entities/notification';
import { getAccessTokenSubject, selectAccessToken, selectCurrentUser } from '@/entities/user';
import { useFindFamilyEventsQuery } from '@/features/family-events';
import { useFindIncomingInvitationsQuery } from '@/features/family-invitations';
import type { TaskResponseDto } from '@/shared/api';
import { useList3Query, useListQuery } from '@/shared/api';
import { AnimatedPanel, AsyncState, Button } from '@/shared/ui';
import { FirstDateTracker } from '@/widgets/first-date-tracker';

type DashboardEntry = { accent: string; id: string; meta: string; title: string; to: string };

const startOfToday = dayjs().startOf('day');
const startOfTomorrow = startOfToday.add(1, 'day');
const endOfWeek = startOfToday.add(7, 'day');
const formatTime = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(new Date(value));
const formatWeekDate = (value: string) => dayjs(value).locale('ru').format('ddd, D MMM · HH:mm');
const formatUnreadCount = (count: number) =>
  `${count} ${count % 10 === 1 && count % 100 !== 11 ? 'непрочитанное' : 'непрочитанных'}`;

const IDLE_DELAY = 30000;
const IDLE_EXIT_OFFSET = 260;

const idleBlockVariants = {
  active: {
    filter: 'blur(0px)',
    opacity: 1,
    rotate: 0,
    rotateY: 0,
    scale: 1,
    skewX: 0,
    x: 0,
    y: 0,
  },
  idle: ({ direction }: { direction: 1 | -1 }) => ({
    filter: 'blur(4px)',
    opacity: 0.05,
    rotate: direction * 13,
    rotateY: direction * 30,
    scale: 0.86,
    skewX: direction * 7,
    x: direction * 74,
    y: IDLE_EXIT_OFFSET,
  }),
};

const IdleBlock = ({
  children,
  delay = 0,
  direction,
  isIdle,
}: {
  children: ReactNode;
  delay?: number;
  direction: 1 | -1;
  isIdle: boolean;
}) => (
  <motion.div
    animate={isIdle ? 'idle' : 'active'}
    custom={{ direction }}
    initial="active"
    style={{
      perspective: 900,
      transformOrigin: direction === 1 ? 'right center' : 'left center',
    }}
    variants={idleBlockVariants}
    transition={{
      delay,
      duration: 1.05,
      ease: [0.22, 1, 0.36, 1],
    }}
  >
    {children}
  </motion.div>
);

const DashboardCard = ({
  action,
  children,
  icon: Icon,
  title,
}: {
  action?: ReactNode;
  children: ReactNode;
  icon: LucideIcon;
  title: string;
}) => (
  <AnimatedPanel className="min-w-0 p-5 sm:p-6">
    <div className="mb-4 flex items-center justify-between gap-gap">
      <div className="flex min-w-0 items-center gap-gap">
        <Icon aria-hidden="true" className="text-cyber-cyan size-5 shrink-0" />
        <h2 className="text-text truncate text-lg font-semibold">{title}</h2>
      </div>
      {action}
    </div>
    {children}
  </AnimatedPanel>
);

const EntryList = ({ empty, entries }: { empty: string; entries: DashboardEntry[] }) => {
  const navigate = useNavigate();
  if (!entries.length) return <p className="text-muted-text py-5 text-center text-sm">{empty}</p>;

  return (
    <div className="space-y-2">
      {entries.slice(0, 6).map((entry) => (
        <button
          className="border-border bg-elevated/35 hover:border-primary-neon/60 flex w-full items-center gap-gap rounded-2xl border p-3 text-left outline-none transition-colors focus-visible:border-cyber-cyan"
          key={entry.id}
          onClick={() => navigate(entry.to)}
          type="button"
        >
          <span className={`size-2 shrink-0 rounded-full ${entry.accent}`} />
          <span className="min-w-0 flex-1">
            <span className="text-text block truncate text-sm font-medium">{entry.title}</span>
            <span className="text-muted-text mt-0.5 block truncate text-xs">{entry.meta}</span>
          </span>
          <ChevronRight aria-hidden="true" className="text-muted-text size-4 shrink-0" />
        </button>
      ))}
    </div>
  );
};

const QuickActions = () => {
  const navigate = useNavigate();
  const actions = [
    { icon: ListChecks, label: 'Новая задача', to: '/tasks' },
    { icon: CalendarDays, label: 'Новое событие', to: '/my_family/calendar' },
    { icon: ShoppingBasket, label: 'Добавить покупку', to: '/my_family/shopping-lists' },
  ];

  return (
    <div className="grid gap-gap sm:grid-cols-3">
      {actions.map(({ icon: Icon, label, to }) => (
        <Button className="w-full" key={to} onClick={() => navigate(to)} size="s">
          <Icon aria-hidden="true" className="size-4" /> {label}
        </Button>
      ))}
    </div>
  );
};

export const MainPage = () => {
  const [isIdle, setIsIdle] = useState(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastIdleResetRef = useRef(0);
  const navigate = useNavigate();
  const accessToken = useSelector(selectAccessToken);
  const currentUser = useSelector(selectCurrentUser);
  const currentUserId = currentUser?.id ?? getAccessTokenSubject(accessToken);
  const tasksQuery = useListQuery({ limit: 100, page: 1 });
  const eventsQuery = useFindFamilyEventsQuery({
    dateFrom: startOfToday.format('YYYY-MM-DD'),
    dateTo: endOfWeek.add(1, 'day').format('YYYY-MM-DD'),
    limit: 100,
    page: 1,
  });
  const invitationsQuery = useFindIncomingInvitationsQuery();
  const notificationsQuery = useList3Query();
  const tasks = ((tasksQuery.data as { data?: TaskResponseDto[] } | undefined)?.data ?? []).filter(
    (task) => task.status === 'OPEN',
  );
  const events = eventsQuery.data?.data ?? [];
  const invitations = (invitationsQuery.data ?? []).filter(({ status }) => status === 'PENDING');
  const notifications = (notificationsQuery.data as Notification[] | undefined) ?? [];
  const unreadNotifications = notifications.filter(({ readAt }) => !readAt);

  const todayEntries: DashboardEntry[] = [
    ...tasks
      .filter(({ dueAt }) => dueAt && dayjs(String(dueAt)).isBefore(startOfTomorrow))
      .map((task) => {
        const dueAt = String(task.dueAt);
        const overdue = dayjs(dueAt).isBefore(startOfToday);
        return {
          accent: overdue ? 'bg-neon-pink' : 'bg-acid-green',
          id: `task:${task.id}`,
          meta: overdue ? `Просрочено · ${formatWeekDate(dueAt)}` : formatTime(dueAt),
          title: task.title,
          to: '/tasks',
        };
      }),
    ...events
      .filter(({ scheduledAt }) => {
        const date = dayjs(scheduledAt);
        return !date.isBefore(startOfToday) && date.isBefore(startOfTomorrow);
      })
      .map((event) => ({
        accent: 'bg-cyber-cyan',
        id: `event:${event.id}`,
        meta: `${formatTime(event.scheduledAt)} · ${event.location}`,
        title: event.name,
        to: '/my_family/calendar',
      })),
  ];
  const weekEntries: DashboardEntry[] = [
    ...tasks
      .filter(({ dueAt }) => {
        const date = dayjs(String(dueAt));
        return dueAt && !date.isBefore(startOfTomorrow) && date.isBefore(endOfWeek);
      })
      .map((task) => ({
        accent: 'bg-acid-green',
        id: `task:${task.id}`,
        meta: `Задача · ${formatWeekDate(String(task.dueAt))}`,
        title: task.title,
        to: '/tasks',
      })),
    ...events
      .filter(({ scheduledAt }) => {
        const date = dayjs(scheduledAt);
        return !date.isBefore(startOfTomorrow) && date.isBefore(endOfWeek);
      })
      .map((event) => ({
        accent: 'bg-cyber-cyan',
        id: `event:${event.id}`,
        meta: `Событие · ${formatWeekDate(event.scheduledAt)}`,
        title: event.name,
        to: '/my_family/calendar',
      })),
  ];
  const decisionEntries: DashboardEntry[] = [
    ...invitations.map((invitation) => ({
      accent: 'bg-primary-neon',
      id: `invitation:${invitation.id}`,
      meta: 'Приглашение в семью',
      title: `${invitation.sender.firstName} ${invitation.sender.lastName}`,
      to: '/my_family/family-invitations',
    })),
    ...events
      .filter(({ proposedBy, status }) => status === 'PROPOSED' && proposedBy.id !== currentUserId)
      .map((event) => ({
        accent: 'bg-cyber-cyan',
        id: `proposal:${event.id}`,
        meta: `Событие ждёт ответа · ${formatWeekDate(event.scheduledAt)}`,
        title: event.name,
        to: '/my_family/calendar',
      })),
    ...unreadNotifications.slice(0, 3).map((notification) => ({
      accent: 'bg-neon-pink',
      id: `notification:${notification.id}`,
      meta: 'Непрочитанное уведомление',
      title: notification.title,
      to: '/settings',
    })),
  ];
  const cockpitError =
    tasksQuery.error || eventsQuery.error || invitationsQuery.error || notificationsQuery.error;
  const cockpitLoading =
    tasksQuery.isLoading ||
    eventsQuery.isLoading ||
    invitationsQuery.isLoading ||
    notificationsQuery.isLoading;
  const refreshCockpit = () => {
    tasksQuery.refetch();
    eventsQuery.refetch();
    invitationsQuery.refetch();
    notificationsQuery.refetch();
  };

  const resetIdleTimer = useCallback(() => {
    const now = Date.now();
    if (now - lastIdleResetRef.current < 250) return;
    lastIdleResetRef.current = now;

    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    setIsIdle(false);
    idleTimerRef.current = setTimeout(() => setIsIdle(true), IDLE_DELAY);
  }, []);

  useEffect(() => {
    resetIdleTimer();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [resetIdleTimer]);

  return (
    <main
      className={`text-text h-full overflow-auto ${isIdle ? 'main-idle-scroll' : ''}`}
      onFocusCapture={resetIdleTimer}
      onPointerDown={resetIdleTimer}
      onPointerMove={resetIdleTimer}
      onWheel={resetIdleTimer}
    >
      <div className="w-full space-y-5">
        <IdleBlock delay={0.12} direction={-1} isIdle={isIdle}>
          <AnimatedPanel className="page-header flex flex-col justify-between gap-gap sm:flex-row sm:items-end">
            <div>
              <p className="text-cyber-cyan text-xs font-semibold uppercase tracking-[0.2em]">
                Семейный стол
              </p>
              <h1 className="text-text mt-1 text-2xl font-semibold sm:text-3xl">
                Что важно сейчас
              </h1>
              <p className="text-muted-text mt-1 text-sm">
                Сегодня, ближайшая неделя и вопросы, которым нужен ответ.
              </p>
            </div>
            <Button onClick={() => navigate('/settings')} size="s">
              <Bell aria-hidden="true" className="size-4" />
              {unreadNotifications.length
                ? formatUnreadCount(unreadNotifications.length)
                : 'Уведомлений нет'}
            </Button>
          </AnimatedPanel>
        </IdleBlock>

        <IdleBlock delay={0.2} direction={1} isIdle={isIdle}>
          <DashboardCard icon={Plus} title="Быстрые действия">
            <QuickActions />
          </DashboardCard>
        </IdleBlock>

        <AsyncState
          error={cockpitError}
          errorMessage="Не удалось собрать семейный обзор"
          hasData={Boolean(
            tasksQuery.data || eventsQuery.data || invitationsQuery.data || notificationsQuery.data,
          )}
          isLoading={cockpitLoading}
          loading={<AnimatedPanel className="text-muted-text p-6">Собираем обзор…</AnimatedPanel>}
          onRetry={refreshCockpit}
        >
          <div className="grid items-start gap-gap lg:grid-cols-[1.15fr_0.85fr]">
            <IdleBlock delay={0.24} direction={-1} isIdle={isIdle}>
              <DashboardCard icon={Clock3} title={`Сегодня · ${todayEntries.length}`}>
                <EntryList empty="На сегодня всё спокойно." entries={todayEntries} />
              </DashboardCard>
            </IdleBlock>
            <IdleBlock delay={0.38} direction={1} isIdle={isIdle}>
              <DashboardCard icon={CalendarDays} title={`На неделе · ${weekEntries.length}`}>
                <EntryList empty="На ближайшую неделю планов нет." entries={weekEntries} />
              </DashboardCard>
            </IdleBlock>
            <IdleBlock delay={0.52} direction={-1} isIdle={isIdle}>
              <DashboardCard icon={AlertCircle} title={`Нужно решение · ${decisionEntries.length}`}>
                <EntryList empty="Сейчас ничего не ждёт ответа." entries={decisionEntries} />
              </DashboardCard>
            </IdleBlock>
          </div>
        </AsyncState>

        <div className="grid items-start gap-gap lg:grid-cols-[minmax(18rem,0.7fr)_minmax(0,1.3fr)]">
          <IdleBlock delay={0.66} direction={1} isIdle={isIdle}>
            <DashboardCard icon={Heart} title="Наша история">
              <FirstDateTracker />
            </DashboardCard>
          </IdleBlock>
          <IdleBlock delay={0.8} direction={-1} isIdle={isIdle}>
            <DashboardCard icon={MailCheck} title="Семейные разделы">
              <div className="grid gap-gap sm:grid-cols-2">
                <button
                  className="border-border bg-elevated/35 hover:border-primary-neon/60 rounded-2xl border p-4 text-left outline-none focus-visible:border-cyber-cyan"
                  onClick={() => navigate('/my_family/family-invitations')}
                  type="button"
                >
                  <MailCheck className="text-primary-neon size-5" />
                  <span className="text-text mt-3 block text-sm font-medium">Приглашения</span>
                  <span className="text-muted-text mt-1 block text-xs">
                    Входящих: {invitations.length}
                  </span>
                </button>
                <button
                  className="border-border bg-elevated/35 hover:border-primary-neon/60 rounded-2xl border p-4 text-left outline-none focus-visible:border-cyber-cyan"
                  onClick={() => navigate('/my_family/shopping-lists')}
                  type="button"
                >
                  <ShoppingBasket className="text-acid-green size-5" />
                  <span className="text-text mt-3 block text-sm font-medium">Покупки</span>
                  <span className="text-muted-text mt-1 block text-xs">
                    Открыть семейные списки
                  </span>
                </button>
              </div>
            </DashboardCard>
          </IdleBlock>
        </div>
      </div>
    </main>
  );
};
