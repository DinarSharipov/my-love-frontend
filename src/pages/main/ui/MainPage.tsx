import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import {
  Bell,
  CalendarDays,
  HeartPulse,
  ListChecks,
  Plus,
  Repeat2,
  ShoppingBasket,
  Target,
  TriangleAlert,
  WalletCards,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  type FinancialGoal,
  type FinancialSummary,
  type RecurringPayment,
  useGetFinancialSummaryQuery,
  useListFinancialGoalsQuery,
  useListRecurringPaymentsQuery,
} from '@/entities/finance';
import { type WellbeingCheckIn, useListWellbeingCheckInsQuery } from '@/entities/wellbeing';
import { getCalendarTasks } from '@/entities/task';
import { useFindFamilyEventsQuery } from '@/features/family-events';
import { type FamilyDashboardResponseDto, useDashboardQuery, useListQuery } from '@/shared/api';
import type { CalendarVisiblePeriod, PlannedItem } from '@/shared/ui';
import { AnimatedPanel, AsyncState, Button, Calendar, HeaderPanel } from '@/shared/ui';

const getInitialPeriod = (): CalendarVisiblePeriod => {
  const from = dayjs().startOf('month').startOf('week').add(1, 'day');

  return { from: from.toDate(), toExclusive: from.add(42, 'day').toDate() };
};

const formatMinor = (amountMinor: string, currency: string) => {
  const amount = Number(amountMinor) / 100;
  if (!Number.isFinite(amount)) return `${amountMinor} ${currency}`;

  return new Intl.NumberFormat('ru-RU', {
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: 'currency',
  }).format(amount);
};

type QuickActionsProps = {
  dashboard?: FamilyDashboardResponseDto;
  hasFamily: boolean;
  isInsightsLoading: boolean;
  financialSummary?: FinancialSummary;
  goals?: FinancialGoal[];
  recurringPayments?: RecurringPayment[];
  checkIns?: WellbeingCheckIn[];
};

const QuickActions = ({
  checkIns,
  dashboard,
  financialSummary,
  goals,
  hasFamily,
  isInsightsLoading,
  recurringPayments,
}: QuickActionsProps) => {
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
      <div className="flex flex-wrap gap-2 items-center">
        {actions.map(({ icon: Icon, label, to }) => (
          <Button className="w-full justify-start" key={to} onClick={() => navigate(to)} size="s">
            <Icon aria-hidden="true" className="size-4" />
            {label}
          </Button>
        ))}
      </div>

      {hasFamily && (
        <div className="mt-5 space-y-gap">
          <div className="border-border bg-elevated/30 rounded-2xl border p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-muted-text flex items-center gap-1 text-xs">
                <WalletCards aria-hidden="true" className="text-cyber-cyan size-3.5" /> Финансы
              </p>
              <Button onClick={() => navigate('/my_family/finance')} size="s">
                Открыть
              </Button>
            </div>
            {(() => {
              if (isInsightsLoading) {
                return <p className="text-muted-text mt-2 text-sm">Сверяем сводку…</p>;
              }

              if (!financialSummary?.categories.length) {
                return <p className="text-muted-text mt-2 text-sm">Данных за период пока нет.</p>;
              }

              const totals = financialSummary.categories
                .flatMap((category) => category.actual)
                .reduce<Array<{ currency: string; amountMinor: number }>>((result, item) => {
                  const current = result.find((total) => total.currency === item.currency);
                  const amount = Number(item.amountMinor);
                  if (!current) {
                    result.push({
                      amountMinor: Number.isFinite(amount) ? amount : 0,
                      currency: item.currency,
                    });
                  } else if (Number.isFinite(amount)) {
                    current.amountMinor += amount;
                  }
                  return result;
                }, []);
              const nearestPayment = recurringPayments?.reduce<RecurringPayment | undefined>(
                (nearest, payment) =>
                  !nearest || new Date(payment.nextDueAt) < new Date(nearest.nextDueAt)
                    ? payment
                    : nearest,
                undefined,
              );

              return (
                <div className="mt-2 space-y-1">
                  {totals.slice(0, 2).map((total) => (
                    <p className="text-text text-sm font-semibold" key={total.currency}>
                      {formatMinor(String(total.amountMinor), total.currency)}
                    </p>
                  ))}
                  {nearestPayment ? (
                    <p className="text-muted-text flex items-center gap-1 text-xs">
                      <Repeat2 aria-hidden="true" className="size-3" />
                      Ближайший платёж:{' '}
                      {new Date(nearestPayment.nextDueAt).toLocaleDateString('ru-RU')}
                    </p>
                  ) : null}
                </div>
              );
            })()}
          </div>

          <div className="grid gap-gap sm:grid-cols-2 lg:grid-cols-1">
            <div className="border-border bg-elevated/30 rounded-2xl border p-3">
              <p className="text-muted-text flex items-center gap-1 text-xs">
                <Target aria-hidden="true" className="text-cyber-cyan size-3.5" /> Цель
              </p>
              {goals?.length ? (
                (() => {
                  const goal = goals
                    .filter((item) => !item.archived)
                    .sort(
                      (left, right) =>
                        Number(right.currentAmountMinor) / Number(right.targetAmountMinor) -
                        Number(left.currentAmountMinor) / Number(left.targetAmountMinor),
                    )[0];
                  if (!goal)
                    return <p className="text-muted-text mt-2 text-sm">Нет активных целей.</p>;
                  const progress = Math.min(
                    100,
                    Math.max(
                      0,
                      (Number(goal.currentAmountMinor) / Number(goal.targetAmountMinor)) * 100,
                    ),
                  );
                  return (
                    <>
                      <p className="text-text mt-1 truncate text-sm font-semibold">{goal.title}</p>
                      <div className="bg-border mt-2 h-1.5 overflow-hidden rounded-full">
                        <div
                          className="from-primary-neon to-cyber-cyan h-full rounded-full bg-gradient-to-r"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-muted-text mt-1 text-xs">
                        {Math.round(progress)}% накоплено
                      </p>
                    </>
                  );
                })()
              ) : (
                <p className="text-muted-text mt-2 text-sm">Целей пока нет.</p>
              )}
            </div>

            <div className="border-border bg-elevated/30 rounded-2xl border p-3">
              <p className="text-muted-text flex items-center gap-1 text-xs">
                <HeartPulse aria-hidden="true" className="text-cyber-cyan size-3.5" /> Состояние
              </p>
              {checkIns?.length ? (
                (() => {
                  const latest = [...checkIns].sort(
                    (left, right) =>
                      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
                  )[0];
                  return (
                    <p className="text-text mt-1 text-sm font-semibold">
                      Настроение {latest.mood}/5 · энергия {latest.energy}/5
                    </p>
                  );
                })()
              ) : (
                <p className="text-muted-text mt-2 text-sm">Check-in ещё не заполнен.</p>
              )}
            </div>
          </div>
        </div>
      )}
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
  const hasFamily = Boolean(dashboardQuery.data);
  const financialSummaryQuery = useGetFinancialSummaryQuery(undefined, { skip: !hasFamily });
  const goalsQuery = useListFinancialGoalsQuery(undefined, { skip: !hasFamily });
  const recurringPaymentsQuery = useListRecurringPaymentsQuery(undefined, { skip: !hasFamily });
  const checkInsQuery = useListWellbeingCheckInsQuery(undefined, { skip: !hasFamily });
  const events = useMemo(() => eventsQuery.data?.data ?? [], [eventsQuery.data?.data]);
  const tasks = getCalendarTasks(tasksQuery.data);
  const plannedItems = useMemo<PlannedItem[]>(
    () => [
      ...events.map((event) => ({
        date: new Date(event.scheduledAt),
        id: `event:${event.id}`,
        name: event.name,
        type: 'event' as const,
      })),
      ...tasks.map((task) => ({
        date: new Date(task.dueAt),
        id: `task:${task.id}`,
        name: `Задача: ${task.title}`,
        type: 'task' as const,
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
        <HeaderPanel
          className="mb-5"
          left={
            <>
              <p className="text-cyber-cyan text-xs font-semibold uppercase tracking-[0.2em]">
                Семейный стол
              </p>
              <h1 className="text-text mt-1 text-2xl font-semibold sm:text-3xl">Главная</h1>
              <p className="text-muted-text mt-1 text-sm">
                Календарь семьи и быстрый доступ к основным действиям.
              </p>
            </>
          }
        />

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
                  onSelectItem={(item) => {
                    const kind = item.type ?? String(item.id).split(':', 1)[0];
                    navigate(kind === 'task' ? '/my_family/tasks' : '/my_family/calendar');
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
              <QuickActions
                checkIns={checkInsQuery.data}
                dashboard={dashboardQuery.data}
                financialSummary={financialSummaryQuery.data}
                goals={goalsQuery.data}
                hasFamily={hasFamily}
                isInsightsLoading={
                  financialSummaryQuery.isLoading ||
                  goalsQuery.isLoading ||
                  recurringPaymentsQuery.isLoading ||
                  checkInsQuery.isLoading
                }
                recurringPayments={recurringPaymentsQuery.data}
              />
            </AnimatedPanel>
          </div>
        </AsyncState>
      </div>
    </main>
  );
};
