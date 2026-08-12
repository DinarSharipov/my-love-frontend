import { HeartHandshake, Search, UsersRound } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

import { useFindMyFamilyQuery } from '@/shared/api';
import { Button } from '@/shared/ui';
import { FirstDateTracker } from '@/widgets/first-date-tracker';

const isNotFoundError = (error: unknown) =>
  typeof error === 'object' && error !== null && 'status' in error && error.status === 404;

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(date),
  );

export const MyFamilyPage = () => {
  const navigate = useNavigate();
  const { data, error, isLoading, refetch } = useFindMyFamilyQuery();

  if (isLoading) {
    return (
      <main className="grid h-full place-items-center pb-24">
        <motion.div
          animate={{ opacity: [0.35, 1, 0.35], scale: [0.96, 1.04, 0.96] }}
          className="border-primary-neon/40 bg-primary-neon/10 h-24 w-24 rounded-full border blur-sm"
          transition={{ duration: 2, repeat: Infinity }}
        />
      </main>
    );
  }

  if (!data && isNotFoundError(error)) {
    return (
      <main className="grid h-full place-items-center pb-24">
        <motion.section
          animate={{ opacity: 1, y: 0 }}
          className="border-border bg-surface/70 relative w-full max-w-xl overflow-hidden rounded-3xl border p-8 text-center shadow-[0_0_55px_rgba(176,38,255,0.12)] backdrop-blur-xl sm:p-12"
          initial={{ opacity: 0, y: 18 }}
        >
          <div className="bg-primary-neon/10 pointer-events-none absolute left-1/2 top-0 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
          <HeartHandshake
            className="text-primary-neon relative mx-auto mb-5 h-12 w-12"
            strokeWidth={1.4}
          />
          <h1 className="text-text relative text-2xl font-semibold sm:text-3xl">
            У вас ещё нет семьи
          </h1>
          <p className="text-muted-text relative mx-auto mt-3 max-w-md text-sm leading-relaxed sm:text-base">
            Поищем партнёра? Возможно, ваша общая история начнётся уже сегодня.
          </p>
          <Button
            className="mt-7 w-full sm:w-auto"
            containerClassName="w-full sm:w-auto"
            onClick={() => navigate('/all_users')}
          >
            <span className="flex items-center justify-center gap-2">
              <Search aria-hidden="true" className="h-4 w-4" />
              Искать партнёра
            </span>
          </Button>
        </motion.section>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="grid h-full place-items-center pb-24 text-center">
        <section className="border-neon-pink/30 bg-neon-pink/5 rounded-3xl border p-8">
          <p className="text-neon-pink">Не удалось загрузить данные семьи</p>
          <Button className="mt-5" onClick={() => refetch()} size="s">
            Попробовать снова
          </Button>
        </section>
      </main>
    );
  }

  return (
    <main className="h-full overflow-auto pb-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <header>
          <div className="text-primary-neon mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
            <UsersRound aria-hidden="true" className="h-4 w-4" />
            Моя семья
          </div>
          <h1 className="text-text text-2xl font-semibold sm:text-3xl">Ваше общее пространство</h1>
          <p className="text-muted-text mt-1 text-sm">Семья создана {formatDate(data.createdAt)}</p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          {data.members.map(({ id, joinedAt, user }, index) => (
            <motion.article
              animate={{ opacity: 1, y: 0 }}
              className="border-border bg-surface/70 relative overflow-hidden rounded-3xl border p-5 shadow-[0_0_35px_rgba(176,38,255,0.08)] backdrop-blur-xl"
              initial={{ opacity: 0, y: 16 }}
              key={id}
              transition={{ delay: index * 0.08 }}
              whileHover={{ borderColor: 'var(--color-primary-neon)', y: -3 }}
            >
              <div className="bg-primary-neon/10 absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl" />
              <div className="border-primary-neon/40 bg-primary-neon/10 text-primary-neon relative mb-4 grid h-12 w-12 place-items-center rounded-2xl border text-lg font-semibold">
                {user.firstName.slice(0, 1)}
                {user.lastName.slice(0, 1)}
              </div>
              <h2 className="text-text relative text-lg font-semibold">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-muted-text relative mt-1 text-sm">{user.email}</p>
              <p className="text-muted-text/75 relative mt-4 text-xs">
                В семье с {formatDate(joinedAt)}
              </p>
            </motion.article>
          ))}
        </section>

        <FirstDateTracker />
      </div>
    </main>
  );
};
