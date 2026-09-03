import { AtSign, CalendarDays, Camera, Globe2, MapPin, Trash2, UserRound } from 'lucide-react';
import { useRef, useState } from 'react';

import { AccountSecurityPanel } from '@/features/account-security';
import { FamilyActivityPanel } from '@/features/family-activity';
import {
  ProfileForm,
  useFindCurrentUserQuery,
  useRemoveAvatarMutation,
  useUploadAvatarFileMutation,
} from '@/features/profile';
import { getApiErrorMessage } from '@/shared/api';
import { AnimatedPanel, AsyncState, Button, ConfirmDialog } from '@/shared/ui';

const formatBirthDate = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));

export const ProfilePage = () => {
  const profile = useFindCurrentUserQuery();
  const [removeAvatar, removeAvatarState] = useRemoveAvatarMutation();
  const [uploadAvatar, uploadState] = useUploadAvatarFileMutation();
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const user = profile.data;

  const selectAvatar = () => avatarInputRef.current?.click();

  const handleRemoveAvatar = async () => {
    setAvatarError(null);
    try {
      await removeAvatar().unwrap();
      setIsRemoveDialogOpen(false);
    } catch (error) {
      setAvatarError(getApiErrorMessage(error, 'Не удалось удалить аватар.'));
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const [file] = input.files ?? [];
    input.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarError('Выберите изображение в поддерживаемом формате.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Размер изображения не должен превышать 5 МБ.');
      return;
    }

    setAvatarError(null);
    try {
      await uploadAvatar(file).unwrap();
    } catch (error) {
      setAvatarError(getApiErrorMessage(error, 'Не удалось загрузить аватар.'));
    }
  };

  if (!user) {
    return (
      <AsyncState
        error={profile.error}
        errorMessage="Не удалось загрузить профиль"
        hasData={false}
        isLoading={profile.isLoading}
        loading={
          <main className="h-full overflow-auto p-5">
            <div className="mx-auto w-full space-y-5">
              <div className="border-border bg-elevated/35 h-32 animate-pulse rounded-3xl border" />
              <div className="border-border bg-elevated/35 h-[32rem] animate-pulse rounded-3xl border" />
            </div>
          </main>
        }
        onRetry={profile.refetch}
      >
        <div />
      </AsyncState>
    );
  }

  return (
    <main className="h-full overflow-auto p-5">
      <div className="mx-auto w-full">
        <AnimatedPanel
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-5 sm:p-6"
          initial={{ opacity: 0, y: 10 }}
        >
          <div className="relative h-full">
            <div className="bg-primary-neon/10 pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full blur-3xl" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="flex shrink-0 flex-col items-start gap-2">
                <input
                  accept="image/*"
                  className="sr-only"
                  onChange={handleAvatarChange}
                  ref={avatarInputRef}
                  type="file"
                />
                <div className="border-primary-neon/40 bg-primary-neon/10 relative grid h-20 w-20 overflow-hidden rounded-2xl border text-primary-neon shadow-[0_0_24px_rgba(176,38,255,0.2)]">
                  {user.avatarUrl ? (
                    <img
                      alt="Фото профиля"
                      className="h-full w-full object-cover"
                      src={user.avatarUrl}
                    />
                  ) : (
                    <UserRound aria-hidden="true" className="m-auto h-9 w-9" />
                  )}
                  {uploadState.isLoading && (
                    <span className="bg-background/80 absolute inset-0 grid place-items-center backdrop-blur-sm">
                      <span className="border-primary-neon h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" />
                      <span className="sr-only">Загружаем фото</span>
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-stretch gap-2 xl:flex-row">
                  <Button
                    aria-describedby={avatarError ? 'avatar-upload-error' : undefined}
                    disabled={uploadState.isLoading || removeAvatarState.isLoading}
                    icon={<Camera aria-hidden="true" className="h-3.5 w-3.5" />}
                    isLoading={uploadState.isLoading}
                    onClick={selectAvatar}
                    size="s"
                  >
                    {user.avatarUrl ? 'Изменить фото' : 'Добавить фото'}
                  </Button>
                  {user.avatarUrl && (
                    <Button
                      className="!border-neon-pink/80 !bg-neon-pink/10 !text-neon-pink hover:!bg-neon-pink/20"
                      disabled={uploadState.isLoading || removeAvatarState.isLoading}
                      icon={<Trash2 aria-hidden="true" className="h-3.5 w-3.5" />}
                      onClick={() => setIsRemoveDialogOpen(true)}
                      size="s"
                    >
                      Удалить фото
                    </Button>
                  )}
                </div>
                {avatarError && (
                  <p
                    className="text-neon-pink max-w-56 text-xs"
                    id="avatar-upload-error"
                    role="alert"
                  >
                    {avatarError}
                  </p>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-cyber-cyan text-xs font-semibold uppercase tracking-[0.2em]">
                  Личный кабинет
                </p>
                <h1 className="text-text mt-1 break-words text-2xl font-semibold sm:text-3xl">
                  {user.firstName} {user.lastName}
                </h1>
                <div className="text-muted-text mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs">
                  <span className="inline-flex items-center gap-2.5">
                    <AtSign aria-hidden="true" className="h-3.5 w-3.5" />
                    {user.email}
                  </span>
                  <span className="inline-flex items-center gap-2.5">
                    <CalendarDays aria-hidden="true" className="h-3.5 w-3.5" />
                    {formatBirthDate(user.birthDate)}
                  </span>
                  <span className="inline-flex items-center gap-2.5">
                    <Globe2 aria-hidden="true" className="h-3.5 w-3.5" />
                    {user.locale}
                  </span>
                  <span className="inline-flex items-center gap-2.5">
                    <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
                    {user.timeZone}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </AnimatedPanel>

        <AnimatedPanel className="p-5 sm:p-6">
          <header className="mb-5">
            <h2 className="text-text text-lg font-semibold">Настройки профиля</h2>
            <p className="text-muted-text mt-1 text-sm">
              Email и дату рождения пока нельзя менять из приложения.
            </p>
          </header>
          <ProfileForm onRefresh={profile.refetch} user={user} />
        </AnimatedPanel>

        <AccountSecurityPanel />
        <FamilyActivityPanel />
      </div>
      <ConfirmDialog
        confirmLabel="Удалить фото"
        description="Фото профиля будет удалено. Вы сможете загрузить новое в любой момент."
        isLoading={removeAvatarState.isLoading}
        onCancel={() => setIsRemoveDialogOpen(false)}
        onConfirm={handleRemoveAvatar}
        open={isRemoveDialogOpen}
        title="Удалить фото профиля?"
      />
    </main>
  );
};
