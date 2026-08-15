import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'motion/react';
import { KeyRound, Laptop, LogOut, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';

import {
  getApiErrorMessage,
  useChangePasswordMutation,
  useListSessionsQuery,
  useRevokeOtherSessionsMutation,
  useRevokeSessionMutation,
} from '@/shared/api';
import type { AuthSessionResponseDto } from '@/shared/api';
import { Button, Input } from '@/shared/ui';
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from '@/features/account-security/model/accountSecuritySchema';

type Notice = { message: string; type: 'error' | 'success' };

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));

const describeSession = (session: AuthSessionResponseDto) =>
  session.userAgent?.trim() || session.ipAddress || 'Неизвестное устройство';

export const AccountSecurityPanel = () => {
  const sessions = useListSessionsQuery();
  const [changePassword, changePasswordState] = useChangePasswordMutation();
  const [revokeSession, revokeSessionState] = useRevokeSessionMutation();
  const [revokeOtherSessions, revokeOtherSessionsState] = useRevokeOtherSessionsMutation();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<ChangePasswordFormValues>({ resolver: zodResolver(changePasswordSchema) });

  const refreshSessions = () => {
    sessions.refetch();
  };

  const handleChangePassword = handleSubmit(async ({ currentPassword, newPassword }) => {
    setNotice(null);

    try {
      await changePassword({ changePasswordDto: { currentPassword, newPassword } }).unwrap();
      reset();
      refreshSessions();
      setNotice({
        message: 'Пароль изменён. Все остальные активные сессии завершены.',
        type: 'success',
      });
    } catch (error) {
      setNotice({
        message: getApiErrorMessage(error, 'Не удалось изменить пароль'),
        type: 'error',
      });
    }
  });

  const handleRevokeSession = async (session: AuthSessionResponseDto) => {
    setActiveSessionId(session.id);
    setNotice(null);

    try {
      await revokeSession({ id: session.id }).unwrap();
      setNotice({ message: 'Сессия завершена', type: 'success' });
    } catch (error) {
      setNotice({
        message: getApiErrorMessage(error, 'Не удалось завершить сессию'),
        type: 'error',
      });
    } finally {
      setActiveSessionId(null);
    }
  };

  const handleRevokeOtherSessions = async () => {
    setNotice(null);

    try {
      await revokeOtherSessions().unwrap();
      setNotice({ message: 'Все остальные сессии завершены', type: 'success' });
    } catch (error) {
      setNotice({
        message: getApiErrorMessage(error, 'Не удалось завершить остальные сессии'),
        type: 'error',
      });
    }
  };

  const nonCurrentSessions = sessions.data?.filter((session) => !session.isCurrent) ?? [];
  const isSessionMutationLoading =
    revokeSessionState.isLoading || revokeOtherSessionsState.isLoading;

  let sessionsContent: ReactNode;
  if (sessions.isLoading) {
    sessionsContent = (
      <div className="space-y-2" role="status">
        {[0, 1].map((item) => (
          <div className="border-border h-20 animate-pulse rounded-xl border" key={item} />
        ))}
      </div>
    );
  } else if (sessions.error && !sessions.data) {
    sessionsContent = (
      <div className="text-neon-pink py-6 text-center text-sm">
        Не удалось загрузить активные сессии
      </div>
    );
  } else if (sessions.data?.length) {
    sessionsContent = (
      <>
        <div className="max-h-80 space-y-2 overflow-auto pr-1">
          {sessions.data.map((session) => (
            <article
              className="border-border bg-surface/60 flex items-start justify-between gap-3 rounded-xl border p-3"
              key={session.id}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-text truncate text-xs font-medium">
                    {describeSession(session)}
                  </p>
                  {session.isCurrent && (
                    <span className="border-acid-green/35 bg-acid-green/10 text-acid-green rounded-full border px-2 py-0.5 text-[10px]">
                      Текущая
                    </span>
                  )}
                </div>
                <p className="text-muted-text mt-1 text-[11px]">
                  {session.ipAddress ?? 'IP не определён'} · активность{' '}
                  {formatDateTime(session.lastSeenAt)}
                </p>
              </div>
              {!session.isCurrent && (
                <Button
                  aria-label="Завершить сессию"
                  className="border-neon-pink/50 text-neon-pink hover:bg-neon-pink/10"
                  disabled={isSessionMutationLoading}
                  onClick={() => handleRevokeSession(session)}
                  size="s"
                >
                  <Trash2 aria-hidden="true" className="h-4 w-4" />
                  <span className="sr-only">
                    {activeSessionId === session.id ? 'Завершаем…' : 'Завершить сессию'}
                  </span>
                </Button>
              )}
            </article>
          ))}
        </div>
        {nonCurrentSessions.length > 0 && (
          <Button
            className="border-neon-pink/50 text-neon-pink hover:bg-neon-pink/10 mt-4"
            disabled={isSessionMutationLoading}
            onClick={handleRevokeOtherSessions}
            size="s"
          >
            <span className="flex items-center gap-2">
              <LogOut aria-hidden="true" className="h-4 w-4" />
              {revokeOtherSessionsState.isLoading ? 'Завершаем…' : 'Завершить все остальные'}
            </span>
          </Button>
        )}
      </>
    );
  } else {
    sessionsContent = (
      <p className="text-muted-text py-6 text-center text-sm">Активных сессий нет</p>
    );
  }

  return (
    <section className="border-border bg-surface/70 mt-5 rounded-3xl border p-5 shadow-[0_0_42px_rgba(255,43,214,0.07)] backdrop-blur-xl sm:p-6">
      <header className="mb-5 flex items-start gap-3">
        <div className="border-neon-pink/35 bg-neon-pink/10 text-neon-pink grid h-10 w-10 shrink-0 place-items-center rounded-2xl border">
          <ShieldCheck aria-hidden="true" className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-text text-lg font-semibold">Безопасность</h2>
          <p className="text-muted-text mt-1 text-sm">
            Изменяйте пароль и управляйте устройствами с доступом к аккаунту.
          </p>
        </div>
      </header>

      <div className="grid gap-7 xl:grid-cols-2">
        <form className="space-y-4" noValidate onSubmit={handleChangePassword}>
          <div className="flex items-center gap-2">
            <KeyRound aria-hidden="true" className="text-primary-neon h-4 w-4" />
            <h3 className="text-text text-sm font-semibold">Смена пароля</h3>
          </div>
          <Input
            {...register('currentPassword')}
            autoComplete="current-password"
            error={errors.currentPassword?.message}
            label="Текущий пароль"
            type="password"
          />
          <Input
            {...register('newPassword')}
            autoComplete="new-password"
            error={errors.newPassword?.message}
            hint="Минимум 8 символов"
            label="Новый пароль"
            type="password"
          />
          <Input
            {...register('confirmPassword')}
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            label="Повторите новый пароль"
            type="password"
          />
          <Button animateVariant="magnetic" disabled={changePasswordState.isLoading} type="submit">
            {changePasswordState.isLoading ? 'Меняем пароль…' : 'Изменить пароль'}
          </Button>
        </form>

        <div className="border-border/80 bg-elevated/25 rounded-2xl border p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Laptop aria-hidden="true" className="text-cyber-cyan h-4 w-4" />
              <h3 className="text-text text-sm font-semibold">Активные сессии</h3>
            </div>
            <Button
              aria-label="Обновить список сессий"
              disabled={sessions.isFetching}
              onClick={refreshSessions}
              size="s"
            >
              <RefreshCw
                aria-hidden="true"
                className={`h-4 w-4 ${sessions.isFetching ? 'animate-spin' : ''}`}
              />
            </Button>
          </div>

          {sessionsContent}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {notice && (
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className={`mt-5 rounded-xl border px-4 py-2.5 text-sm ${
              notice.type === 'success'
                ? 'border-acid-green/35 bg-acid-green/10 text-acid-green'
                : 'border-neon-pink/35 bg-neon-pink/10 text-neon-pink'
            }`}
            exit={{ opacity: 0, y: -4 }}
            initial={{ opacity: 0, y: -4 }}
            key={`${notice.type}-${notice.message}`}
            role="status"
          >
            {notice.message}
          </motion.p>
        )}
      </AnimatePresence>
    </section>
  );
};
