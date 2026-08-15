import { motion } from 'motion/react';
import { AtSign, CalendarDays, Globe2, MapPin, UserRound } from 'lucide-react';

import { AccountSecurityPanel } from '@/features/account-security';
import { ProfileForm, useFindCurrentUserQuery } from '@/features/profile';
import { Button } from '@/shared/ui';

const formatBirthDate = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));

export const ProfilePage = () => {
  const profile = useFindCurrentUserQuery();

  if (profile.isLoading) {
    return (
      <main className="h-full overflow-auto pb-24">
        <div className="mx-auto max-w-4xl space-y-5">
          <div className="border-border bg-elevated/35 h-32 animate-pulse rounded-3xl border" />
          <div className="border-border bg-elevated/35 h-[32rem] animate-pulse rounded-3xl border" />
        </div>
      </main>
    );
  }

  if (profile.error || !profile.data) {
    return (
      <main className="grid h-full place-items-center pb-24">
        <div className="border-neon-pink/30 bg-neon-pink/5 max-w-md rounded-3xl border p-6 text-center">
          <p className="text-neon-pink text-sm">Не удалось загрузить профиль</p>
          <Button className="mt-4" onClick={profile.refetch} size="s">
            Повторить
          </Button>
        </div>
      </main>
    );
  }

  const user = profile.data;

  return (
    <main className="h-full overflow-auto pb-24">
      <div className="mx-auto w-full max-w-4xl">
        <motion.header
          animate={{ opacity: 1, y: 0 }}
          className="border-border bg-surface/70 mb-5 overflow-hidden rounded-3xl border p-5 shadow-[0_0_42px_rgba(176,38,255,0.1)] backdrop-blur-xl sm:p-6"
          initial={{ opacity: 0, y: 10 }}
        >
          <div className="bg-primary-neon/10 pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full blur-3xl" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="border-primary-neon/40 bg-primary-neon/10 text-primary-neon grid h-16 w-16 shrink-0 place-items-center rounded-3xl border shadow-[0_0_24px_rgba(176,38,255,0.2)]">
              <UserRound aria-hidden="true" className="h-8 w-8" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-cyber-cyan text-xs font-semibold uppercase tracking-[0.2em]">
                Личный кабинет
              </p>
              <h1 className="text-text mt-1 truncate text-2xl font-semibold sm:text-3xl">
                {user.firstName} {user.lastName}
              </h1>
              <div className="text-muted-text mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs">
                <span className="inline-flex items-center gap-1.5">
                  <AtSign aria-hidden="true" className="h-3.5 w-3.5" />
                  {user.email}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays aria-hidden="true" className="h-3.5 w-3.5" />
                  {formatBirthDate(user.birthDate)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Globe2 aria-hidden="true" className="h-3.5 w-3.5" />
                  {user.locale}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
                  {user.timeZone}
                </span>
              </div>
            </div>
          </div>
        </motion.header>

        <section className="border-border bg-surface/70 rounded-3xl border p-5 shadow-[0_0_42px_rgba(0,245,255,0.06)] backdrop-blur-xl sm:p-6">
          <header className="mb-5">
            <h2 className="text-text text-lg font-semibold">Настройки профиля</h2>
            <p className="text-muted-text mt-1 text-sm">
              Email и дату рождения пока нельзя менять из приложения.
            </p>
          </header>
          <ProfileForm onRefresh={profile.refetch} user={user} />
        </section>

        <AccountSecurityPanel />
      </div>
    </main>
  );
};
