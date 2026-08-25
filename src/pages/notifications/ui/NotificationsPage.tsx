import { Bell, CheckCheck, Mail, Send } from 'lucide-react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useEffect, useId, useMemo, useState } from 'react';

import type { Notification, NotificationPreferences } from '@/entities/notification';
import {
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} from '@/features/notification-preferences';
import { TelegramConnectionPanel } from '@/features/telegram';
import {
  getApiErrorMessage,
  type NotificationResponseDto,
  useListPaginatedQuery,
  useReadAllMutation,
  useReadMutation,
} from '@/shared/api';
import { AnimatedPanel, AsyncState, Button, Input } from '@/shared/ui';

const PAGE_SIZE = 20;

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
  }).format(new Date(value));

const normalizeNotification = (notification: NotificationResponseDto): Notification => ({
  ...notification,
  body: typeof notification.body === 'string' ? notification.body : null,
  familyId: typeof notification.familyId === 'string' ? notification.familyId : null,
});

const PreferenceToggle = ({
  checked,
  description,
  disabled,
  label,
  onChange,
}: {
  checked: boolean;
  description: string;
  disabled?: boolean;
  label: string;
  onChange: (enabled: boolean) => void;
}) => {
  const inputId = useId();

  return (
    <label
      className="border-border bg-elevated/35 flex cursor-pointer items-start gap-gap rounded-2xl border p-3"
      htmlFor={inputId}
    >
      <input
        checked={checked}
        className="accent-primary-neon mt-1 size-4"
        disabled={disabled}
        id={inputId}
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
      <span>
        <span className="text-text block text-sm font-medium">{label}</span>
        <span className="text-muted-text mt-0.5 block text-xs">{description}</span>
      </span>
    </label>
  );
};

export const NotificationsPage = () => {
  const [page, setPage] = useState(1);
  const [notificationPages, setNotificationPages] = useState<Record<number, Notification[]>>({});
  const [hasMore, setHasMore] = useState(true);
  const inbox = useListPaginatedQuery({ limit: PAGE_SIZE, page });
  const preferencesQuery = useGetNotificationPreferencesQuery();
  const [markRead] = useReadMutation();
  const [markAllRead, markAllState] = useReadAllMutation();
  const [updatePreferences, updateState] = useUpdateNotificationPreferencesMutation();
  const [preferences, setPreferences] = useState<NotificationPreferences>();
  const [error, setError] = useState<string>();

  const notifications = useMemo(
    () =>
      Object.keys(notificationPages)
        .sort((left, right) => Number(left) - Number(right))
        .flatMap((key) => notificationPages[Number(key)] ?? []),
    [notificationPages],
  );
  const unread = notifications.filter((notification) => !notification.readAt);

  useEffect(() => {
    const pageData = inbox.currentData;
    if (!pageData) return;
    const currentPage = pageData.page ?? page;
    setNotificationPages((current) => ({
      ...current,
      [currentPage]: pageData.data.map(normalizeNotification),
    }));
    setHasMore(currentPage < pageData.totalPages);
  }, [inbox.currentData, page]);

  useEffect(() => {
    if (preferencesQuery.data) setPreferences(preferencesQuery.data);
  }, [preferencesQuery.data]);

  const runInboxAction = async (
    action: () => Promise<unknown>,
    updateLocally: (notification: Notification) => Notification,
  ) => {
    setError(undefined);
    try {
      await action();
      setNotificationPages((current) =>
        Object.fromEntries(
          Object.entries(current).map(([currentPage, currentNotifications]) => [
            currentPage,
            currentNotifications.map(updateLocally),
          ]),
        ),
      );
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Не удалось обновить уведомления'));
    }
  };

  const loadMore = () => {
    if (!inbox.isFetching && hasMore) setPage((current) => current + 1);
  };

  const savePreferences = async () => {
    if (!preferences) return;
    setError(undefined);
    try {
      const saved = await updatePreferences(preferences).unwrap();
      setPreferences(saved);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Не удалось сохранить настройки'));
    }
  };

  const updatePreference = <Key extends keyof NotificationPreferences>(
    key: Key,
    value: NotificationPreferences[Key],
  ) => setPreferences((current) => (current ? { ...current, [key]: value } : current));

  return (
    <main className="h-full min-h-0 overflow-hidden p-5">
      <div className="mx-auto grid h-full min-h-0 w-full items-start gap-gap lg:items-stretch lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.7fr)]">
        <section className="min-h-0">
          <AnimatedPanel className="flex h-full min-h-0 flex-col p-5 sm:p-6">
            <p className="text-cyber-cyan text-xs font-semibold uppercase tracking-[0.2em]">
              Семейный inbox
            </p>
            <h1 className="text-text mt-1 text-2xl font-semibold sm:text-3xl">Уведомления</h1>
            <p className="text-muted-text mt-1 text-sm">
              Важные семейные события без лишнего шума.
            </p>
            {error && (
              <p className="text-neon-pink mt-4 text-sm" role="alert">
                {error}
              </p>
            )}

            <div className="mt-6 flex min-h-0 flex-1 flex-col">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-gap">
                <div>
                  <h2 className="text-text flex items-center gap-gap font-semibold">
                    <Bell className="text-cyber-cyan size-5" /> Входящие
                  </h2>
                  <p className="text-muted-text mt-1 text-xs">Непрочитанных: {unread.length}</p>
                </div>
                <Button
                  disabled={!unread.length || markAllState.isLoading}
                  icon={<CheckCheck className="size-4" />}
                  onClick={() =>
                    runInboxAction(
                      () => markAllRead().unwrap(),
                      (notification) =>
                        notification.readAt
                          ? notification
                          : { ...notification, readAt: new Date().toISOString() },
                    )
                  }
                  size="s"
                >
                  Прочитать всё
                </Button>
              </div>
              <div className="flex min-h-0 flex-1 flex-col">
                <AsyncState
                  empty={
                    !inbox.isLoading && notifications.length === 0 ? (
                      <p className="text-muted-text py-8 text-center text-sm">
                        Новых уведомлений нет.
                      </p>
                    ) : undefined
                  }
                  error={inbox.error}
                  errorMessage="Не удалось загрузить уведомления"
                  hasData={Boolean(inbox.currentData)}
                  isLoading={inbox.isLoading}
                  loading={<p className="text-muted-text text-sm">Загружаем уведомления…</p>}
                  onRetry={() => inbox.refetch()}
                >
                  <div
                    className="min-h-0 flex-1 overflow-y-auto pr-1"
                    id="notifications-list-scroll"
                  >
                    <InfiniteScroll
                      dataLength={notifications.length}
                      endMessage={
                        notifications.length > 0 ? (
                          <p className="text-muted-text py-4 text-center text-xs">
                            Все уведомления загружены
                          </p>
                        ) : undefined
                      }
                      hasMore={hasMore}
                      loader={
                        <p className="text-muted-text py-4 text-center text-xs">Загружаем ещё…</p>
                      }
                      next={loadMore}
                      scrollableTarget="notifications-list-scroll"
                    >
                      <div className="space-y-2">
                        {notifications.map((notification) => (
                          <article
                            className={`border-border rounded-2xl border p-4 ${notification.readAt ? 'bg-elevated/25' : 'bg-primary-neon/10'}`}
                            key={notification.id}
                          >
                            <div className="flex items-start gap-gap">
                              <span
                                aria-hidden="true"
                                className={`mt-1 size-2 shrink-0 rounded-full ${notification.readAt ? 'bg-muted-text/40' : 'bg-primary-neon shadow-[0_0_10px_var(--color-primary-neon)]'}`}
                              />
                              <div className="min-w-0 flex-1">
                                <h3 className="text-text text-sm font-semibold">
                                  {notification.title}
                                </h3>
                                {notification.body && (
                                  <p className="text-muted-text mt-1 text-sm">
                                    {notification.body}
                                  </p>
                                )}
                                <p className="text-muted-text mt-2 text-xs">
                                  {formatDate(notification.createdAt)}
                                </p>
                              </div>
                              {!notification.readAt && (
                                <Button
                                  aria-label={`Отметить уведомление «${notification.title}» прочитанным`}
                                  icon={<CheckCheck className="size-4" />}
                                  onClick={() =>
                                    runInboxAction(
                                      () => markRead({ id: notification.id }).unwrap(),
                                      (current) =>
                                        current.id === notification.id
                                          ? { ...current, readAt: new Date().toISOString() }
                                          : current,
                                    )
                                  }
                                  size="s"
                                >
                                  <span className="sr-only">Прочитать</span>
                                </Button>
                              )}
                            </div>
                          </article>
                        ))}
                      </div>
                    </InfiniteScroll>
                  </div>
                </AsyncState>
              </div>
            </div>
          </AnimatedPanel>
        </section>

        <aside className="scrollbar-hidden min-h-0 lg:h-full lg:overflow-y-auto lg:overscroll-contain lg:pr-1">
          <AsyncState
            error={preferencesQuery.error}
            errorMessage="Не удалось загрузить настройки уведомлений"
            hasData={Boolean(preferencesQuery.data)}
            isLoading={preferencesQuery.isLoading}
            loading={
              <AnimatedPanel className="text-muted-text p-5">Загружаем настройки…</AnimatedPanel>
            }
            onRetry={() => preferencesQuery.refetch()}
          >
            {preferences && (
              <div className="space-y-5">
                <AnimatedPanel className="p-5 sm:p-6">
                  <h2 className="text-text font-semibold">Каналы и тишина</h2>
                  <div className="mt-4 space-y-3">
                    <PreferenceToggle
                      checked={preferences.inAppEnabled}
                      description="Показывать события внутри приложения"
                      disabled={updateState.isLoading}
                      label="В приложении"
                      onChange={(value) => updatePreference('inAppEnabled', value)}
                    />
                    <PreferenceToggle
                      checked={preferences.emailEnabled}
                      description="Получать поддержанные системой письма"
                      disabled={updateState.isLoading}
                      label="Email"
                      onChange={(value) => updatePreference('emailEnabled', value)}
                    />
                    <PreferenceToggle
                      checked={preferences.telegramEnabled}
                      description="Использовать подключённый Telegram"
                      disabled={updateState.isLoading}
                      label="Telegram"
                      onChange={(value) => updatePreference('telegramEnabled', value)}
                    />
                    <PreferenceToggle
                      checked={preferences.quietHoursEnabled}
                      description="Не отправлять внешние уведомления в выбранное время"
                      disabled={updateState.isLoading}
                      label="Тихие часы"
                      onChange={(value) => updatePreference('quietHoursEnabled', value)}
                    />
                  </div>
                  {preferences.quietHoursEnabled && (
                    <div className="mt-4 grid gap-gap sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                      <Input
                        label="Начало"
                        onChange={(event) =>
                          updatePreference('quietHoursStart', event.target.value)
                        }
                        type="time"
                        value={preferences.quietHoursStart ?? ''}
                      />
                      <Input
                        label="Окончание"
                        onChange={(event) => updatePreference('quietHoursEnd', event.target.value)}
                        type="time"
                        value={preferences.quietHoursEnd ?? ''}
                      />
                    </div>
                  )}
                  <Button
                    className="mt-4"
                    disabled={updateState.isLoading}
                    icon={<Mail className="size-4" />}
                    onClick={savePreferences}
                  >
                    Сохранить настройки
                  </Button>
                  <p className="text-muted-text mt-3 flex items-start gap-gap text-xs">
                    <Send className="mt-0.5 size-3.5 shrink-0" />
                    Канал сработает только после подключения соответствующего провайдера.
                  </p>
                </AnimatedPanel>
                <TelegramConnectionPanel />
              </div>
            )}
          </AsyncState>
        </aside>
      </div>
    </main>
  );
};
