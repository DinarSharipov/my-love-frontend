import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { Bell, CalendarDays, ListChecks, Plus, ShoppingBasket, TriangleAlert } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getCalendarTasks } from '@/entities/task';
import { useFindFamilyEventsQuery } from '@/features/family-events';
import { type FamilyDashboardResponseDto, useDashboardQuery, useListQuery } from '@/shared/api';
import type { CalendarVisiblePeriod, PlannedItem } from '@/shared/ui';
import { AnimatedPanel, AsyncState, Button, Calendar } from '@/shared/ui';

const getInitialPeriod = (): CalendarVisiblePeriod => {
  const from = dayjs().startOf('month').startOf('week').add(1, 'day');

  return { from: from.toDate(), toExclusive: from.add(42, 'day').toDate() };
};

const QuickActions = ({ dashboard }: { dashboard?: FamilyDashboardResponseDto }) => {
  const navigate = useNavigate();
  const actions = [
    { icon: ListChecks, label: 'Новая задача', to: '/my_family/tasks' },
    { icon: CalendarDays, label: 'Новое событие', to: '/my_family/calendar' },
    { icon: ShoppingBasket, label: 'Добавить покупку', to: '/my_family/shopping-lists' },
  ];

  return (
    <>
      {dashboard && (
        <div className="mb-4 grid grid-cols-2 gap-gap">
          <div className="border-border bg-elevated/30 rounded-2xl border p-3">
            <p className="text-muted-text flex items-center gap-1 text-xs">
              <ListChecks aria-hidden="true" className="size-3.5" /> Открытые задачи
            </p>
            <p className="text-text mt-1 text-xl font-semibold">{dashboard.openTasks}</p>
          </div>
          <div className="border-border bg-elevated/30 rounded-2xl border p-3">
            <p className="text-muted-text flex items-center gap-1 text-xs">
              <TriangleAlert aria-hidden="true" className="size-3.5" /> Просрочено
            </p>
            <p className="text-text mt-1 text-xl font-semibold">{dashboard.overdueTasks}</p>
          </div>
          <div className="border-border bg-elevated/30 rounded-2xl border p-3">
            <p className="text-muted-text flex items-center gap-1 text-xs">
              <ShoppingBasket aria-hidden="true" className="size-3.5" /> Покупки
            </p>
            <p className="text-text mt-1 text-xl font-semibold">
              {dashboard.uncheckedShoppingItems}
            </p>
          </div>
          <div className="border-border bg-elevated/30 rounded-2xl border p-3">
            <p className="text-muted-text flex items-center gap-1 text-xs">
              <Bell aria-hidden="true" className="size-3.5" /> Непрочитанные
            </p>
            <p className="text-text mt-1 text-xl font-semibold">{dashboard.unreadNotifications}</p>
          </div>
        </div>
      )}
      <div className="grid gap-gap sm:grid-cols-3 lg:grid-cols-1">
        {actions.map(({ icon: Icon, label, to }) => (
          <Button className="w-full justify-start" key={to} onClick={() => navigate(to)} size="s">
            <Icon aria-hidden="true" className="size-4" />
            {label}
          </Button>
        ))}
      </div>
    </>
  );
};

export const MainPage = () => {
  const navigate = useNavigate();
  const [visiblePeriod, setVisiblePeriod] = useState(getInitialPeriod);
  const eventsQuery = useFindFamilyEventsQuery({
    dateFrom: dayjs(visiblePeriod.from).format('YYYY-MM-DD'),
    dateTo: dayjs(visiblePeriod.toExclusive).format('YYYY-MM-DD'),
    limit: 100,
    page: 1,
  });
  const tasksQuery = useListQuery({ limit: 100, page: 1 });
  const dashboardQuery = useDashboardQuery();
  const events = useMemo(() => eventsQuery.data?.data ?? [], [eventsQuery.data?.data]);
  const tasks = getCalendarTasks(tasksQuery.data);
  const plannedItems = useMemo<PlannedItem[]>(
    () => [
      ...events.map((event) => ({
        date: new Date(event.scheduledAt),
        id: `event:${event.id}`,
        name: event.name,
      })),
      ...tasks.map((task) => ({
        date: new Date(task.dueAt),
        id: `task:${task.id}`,
        name: `Задача: ${task.title}`,
      })),
    ],
    [events, tasks],
  );
  const handleVisiblePeriodChange = useCallback((period: CalendarVisiblePeriod) => {
    setVisiblePeriod(period);
  }, []);
  const isLoading = eventsQuery.isLoading || tasksQuery.isLoading;
  const error = eventsQuery.error || tasksQuery.error;
  const retry = () => {
    eventsQuery.refetch();
    tasksQuery.refetch();
  };

  return (
    <main className="text-text flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex min-h-0 w-full flex-1 flex-col p-5">
        <AnimatedPanel className="page-header !h-fit mb-5 shrink-0">
          <p className="text-cyber-cyan text-xs font-semibold uppercase tracking-[0.2em]">
            Семейный стол
          </p>
          <h1 className="text-text mt-1 text-2xl font-semibold sm:text-3xl">Главная</h1>
          <p className="text-muted-text mt-1 text-sm">
            Календарь семьи и быстрый доступ к основным действиям.
          </p>
        </AnimatedPanel>

        <AsyncState
          error={error}
          errorMessage="Не удалось загрузить календарь"
          hasData={Boolean(eventsQuery.data || tasksQuery.data)}
          isLoading={isLoading}
          loading={
            <AnimatedPanel className="text-muted-text p-6">Загружаем календарь…</AnimatedPanel>
          }
          onRetry={retry}
        >
          <div className="grid min-h-0 flex-1 items-stretch gap-gap lg:grid-cols-[minmax(0,1.6fr)_minmax(16rem,0.7fr)]">
            <AnimatedPanel className="min-h-0 min-w-0 p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-gap">
                <div className="flex items-center gap-gap">
                  <CalendarDays aria-hidden="true" className="text-cyber-cyan size-5" />
                  <h1 className="text-text text-lg font-semibold">Календарь</h1>
                </div>
                <Button onClick={() => navigate('/my_family/calendar')} size="s">
                  Открыть
                </Button>
              </div>
              <div className="min-h-0 flex-1">
                <Calendar
                  onClickDay={(_, item) => {
                    if (item) navigate('/my_family/calendar');
                  }}
                  onVisiblePeriodChange={handleVisiblePeriodChange}
                  plannedItems={plannedItems}
                  selectionMode="single"
                />
              </div>
            </AnimatedPanel>

            <AnimatedPanel className="min-h-0 min-w-0 p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-gap">
                <Plus aria-hidden="true" className="text-cyber-cyan size-5" />
                <h2 className="text-text text-lg font-semibold">Быстрые действия</h2>
              </div>
              <QuickActions dashboard={dashboardQuery.data} />
            </AnimatedPanel>
          </div>
        </AsyncState>
      </div>
    </main>
  );
};
