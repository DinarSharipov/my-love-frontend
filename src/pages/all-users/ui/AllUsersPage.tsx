import { AnimatePresence, motion } from 'motion/react';
import { MoreHorizontal, Search, Send, UsersRound } from 'lucide-react';
import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';

import type { PublicUserResponseDto } from '@/shared/api';
import {
  getApiErrorMessage,
  useCreateFamilyInvitationMutation,
  useFindUsersQuery,
} from '@/shared/api';
import { Input, Table } from '@/shared/ui';
import type { TableColumn } from '@/shared/ui';

const PAGE_SIZE = 12;

const genderLabels: Record<PublicUserResponseDto['gender'], string> = {
  FEMALE: 'Женщина',
  MALE: 'Мужчина',
  NOT_SPECIFIED: 'Не указан',
  OTHER: 'Другой',
};

type UserActionsProps = {
  disabled: boolean;
  isLoading: boolean;
  onInvite: () => void;
  userName: string;
};

const UserActions = ({ disabled, isLoading, onInvite, userName }: UserActionsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative flex justify-end"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
      }}
    >
      <motion.button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`Действия для ${userName}`}
        className="border-border bg-elevated text-muted-text hover:border-primary-neon/70 hover:text-text grid h-9 w-9 place-items-center rounded-xl border outline-none transition-colors focus-visible:border-cyber-cyan"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
        whileTap={{ scale: 0.9 }}
      >
        <MoreHorizontal aria-hidden="true" className="h-5 w-5" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            animate={{ filter: 'blur(0px)', opacity: 1, scale: 1, y: 0 }}
            className="border-border bg-surface/95 absolute right-0 top-[calc(100%+8px)] z-30 min-w-56 rounded-2xl border p-1.5 shadow-[0_16px_45px_rgba(0,0,0,0.55),0_0_28px_rgba(176,38,255,0.16)] backdrop-blur-2xl"
            exit={{ filter: 'blur(4px)', opacity: 0, scale: 0.96, y: -4 }}
            initial={{ filter: 'blur(4px)', opacity: 0, scale: 0.96, y: -4 }}
            role="menu"
            transition={{ duration: 0.16 }}
          >
            <button
              className="text-text hover:bg-primary-neon/10 hover:text-primary-neon flex w-full items-center gap-gap rounded-xl px-3 py-2.5 text-left text-sm outline-none transition-colors focus-visible:bg-primary-neon/10 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={disabled || isLoading}
              onClick={() => {
                setIsOpen(false);
                onInvite();
              }}
              role="menuitem"
              type="button"
            >
              <Send aria-hidden="true" className="h-4 w-4" />
              {isLoading ? 'Отправляем…' : 'Пригласить в семью'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const AllUsersPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const deferredSearch = useDeferredValue(search.trim());
  const normalizedSearch = deferredSearch.length >= 2 ? deferredSearch : undefined;
  const { data, error, isFetching, isLoading } = useFindUsersQuery({
    limit: PAGE_SIZE,
    page,
    search: normalizedSearch,
  });
  const [createInvitation] = useCreateFamilyInvitationMutation();

  useEffect(() => setPage(1), [normalizedSearch]);

  const handleInvite = useCallback(
    async (user: PublicUserResponseDto) => {
      setActiveUserId(user.id);
      setNotice(null);

      try {
        await createInvitation({ createFamilyInvitationDto: { recipientId: user.id } }).unwrap();
        setNotice({
          message: `Приглашение для ${user.firstName} отправлено`,
          type: 'success',
        });
      } catch (invitationError) {
        setNotice({
          message: getApiErrorMessage(invitationError, 'Не удалось отправить приглашение'),
          type: 'error',
        });
      } finally {
        setActiveUserId(null);
      }
    },
    [createInvitation],
  );

  const columns = useMemo<readonly TableColumn<PublicUserResponseDto>[]>(
    () => [
      {
        header: 'Партнёр',
        id: 'name',
        render: (user) => (
          <div>
            <p className="text-text font-medium">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-muted-text mt-0.5 text-xs">{user.email}</p>
          </div>
        ),
      },
      { header: 'Пол', id: 'gender', render: (user) => genderLabels[user.gender] },
      {
        header: 'Статус',
        id: 'status',
        render: (user) => (
          <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-xs ${
              user.hasFamily
                ? 'border-muted-text/25 bg-muted-text/10 text-muted-text'
                : 'border-acid-green/35 bg-acid-green/10 text-acid-green'
            }`}
          >
            {user.hasFamily ? 'Уже в семье' : 'Свободен'}
          </span>
        ),
      },
      {
        className: 'w-20 text-right',
        header: 'Действия',
        id: 'actions',
        render: (user) => (
          <UserActions
            disabled={user.hasFamily}
            isLoading={activeUserId === user.id}
            onInvite={() => handleInvite(user)}
            userName={`${user.firstName} ${user.lastName}`}
          />
        ),
      },
    ],
    [activeUserId, handleInvite],
  );

  return (
    <main className="flex h-full min-h-0 flex-col gap-gap">
      <header className="page-header flex shrink-0 flex-col gap-gap sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-primary-neon mb-2 flex items-center gap-gap text-xs font-semibold uppercase tracking-[0.2em]">
            <UsersRound aria-hidden="true" className="h-4 w-4" />
            Поиск партнёра
          </div>
          <h1 className="text-text text-2xl font-semibold sm:text-3xl">
            Найдите близкого человека
          </h1>
          <p className="text-muted-text mt-1 text-sm">
            Выберите пользователя и отправьте приглашение в семью.
          </p>
        </div>

        <div className="relative w-full">
          <Search
            aria-hidden="true"
            className="text-muted-text pointer-events-none absolute left-4 top-1/2 z-20 h-4 w-4 -translate-y-1/2"
          />
          <Input
            aria-label="Поиск пользователей"
            className="pl-11"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Имя, фамилия или email"
            value={search}
          />
        </div>
      </header>

      <AnimatePresence mode="wait">
        {notice && (
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className={`shrink-0 rounded-xl border px-4 py-2 text-sm ${
              notice.type === 'success'
                ? 'border-acid-green/35 bg-acid-green/10 text-acid-green'
                : 'border-neon-pink/35 bg-neon-pink/10 text-neon-pink'
            }`}
            exit={{ opacity: 0, y: -5 }}
            initial={{ opacity: 0, y: -5 }}
            key={notice.message}
            role="status"
          >
            {notice.message}
          </motion.p>
        )}
      </AnimatePresence>

      {error && !data ? (
        <div className="border-neon-pink/30 bg-neon-pink/5 text-neon-pink grid min-h-52 flex-1 place-items-center rounded-3xl border p-6 text-center">
          Не удалось загрузить пользователей. Попробуйте обновить страницу.
        </div>
      ) : (
        <div className="min-h-0 flex-1">
          <Table
            ariaLabel="Пользователи для поиска партнёра"
            columns={columns}
            data={data?.data ?? []}
            emptyText={
              normalizedSearch
                ? 'По вашему запросу никого не найдено'
                : 'Пользователи пока не найдены'
            }
            getRowKey={(user) => user.id}
            isLoading={isLoading}
            pagination={{
              disabled: isFetching,
              onChange: setPage,
              page: data?.page ?? page,
              totalPages: data?.totalPages ?? 1,
            }}
          />
        </div>
      )}
    </main>
  );
};
