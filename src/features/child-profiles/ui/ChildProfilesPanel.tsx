import { Baby, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';

import {
  useCreateChildProfileMutation,
  useDeleteChildProfileMutation,
  useLazyExportChildProfileQuery,
  useListChildProfilesQuery,
  useUpdateChildProfileMutation,
} from '@/entities/child';
import {
  AnimatedPanel,
  AsyncState,
  Button,
  ConfirmDialog,
  DatePicker,
  DownloadLoader,
  Input,
} from '@/shared/ui';

export const ChildProfilesPanel = () => {
  const list = useListChildProfilesQuery();
  const [create, createState] = useCreateChildProfileMutation();
  const [update, updateState] = useUpdateChildProfileMutation();
  const [remove, removeState] = useDeleteChildProfileMutation();
  const [exportProfile] = useLazyExportChildProfileQuery();
  const [editing, setEditing] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [actionError, setActionError] = useState<string>();
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const isSaving = createState.isLoading || updateState.isLoading;

  const reset = () => {
    setEditing(null);
    setFirstName('');
    setLastName('');
    setBirthDate('');
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setActionError(undefined);
    if (!firstName.trim() || !birthDate) return;
    const normalizedLastName = lastName.trim();
    const lastNamePayload = editing || normalizedLastName ? { lastName: normalizedLastName } : {};
    const profile = {
      firstName: firstName.trim(),
      birthDate,
      ...lastNamePayload,
    };
    try {
      if (editing) await update({ id: editing, ...profile }).unwrap();
      else await create(profile).unwrap();
      reset();
    } catch {
      setActionError('Не удалось сохранить профиль ребёнка');
    }
  };
  const exportChild = async (childId: string, childName: string) => {
    setActionError(undefined);
    setExportingId(childId);
    try {
      const data = await exportProfile(childId).unwrap();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `child-profile-${childName.toLowerCase().replace(/[^a-zа-я0-9]+/gi, '-')}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setActionError('Не удалось экспортировать профиль ребёнка');
    } finally {
      setExportingId(null);
    }
  };
  const deleteChild = async () => {
    if (!pendingDelete) return;
    setActionError(undefined);
    try {
      await remove(pendingDelete.id).unwrap();
      if (editing === pendingDelete.id) reset();
      setPendingDelete(null);
    } catch {
      setActionError('Не удалось удалить профиль ребёнка');
    }
  };
  return (
    <div className="grid min-w-0 items-start gap-gap lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <AnimatedPanel className="h-fit self-start p-5 sm:p-6">
        <div className="mb-5">
          <h2 className="text-text flex items-center gap-2 font-semibold">
            <Plus className="text-cyber-cyan h-5 w-5" />
            Новый профиль
          </h2>
          <p className="text-muted-text mt-1 text-sm">Добавьте ребёнка в семейное пространство.</p>
        </div>
        <form className="grid gap-gap" onSubmit={submit}>
          <Input
            label="Имя"
            onChange={(event) => setFirstName(event.target.value)}
            required
            value={firstName}
          />
          <Input
            label="Фамилия"
            onChange={(event) => setLastName(event.target.value)}
            value={lastName}
          />
          <DatePicker
            label="Дата рождения"
            onChange={(event) => setBirthDate(event.target.value)}
            required
            value={birthDate}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              icon={editing ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              isLoading={isSaving}
              type="submit"
            >
              {editing ? 'Сохранить' : 'Добавить'}
            </Button>
            {editing && <Button icon={<X className="h-4 w-4" />} onClick={reset} type="button" />}
          </div>
        </form>
        {actionError && (
          <p className="text-neon-pink mt-4 text-sm" role="alert">
            {actionError}
          </p>
        )}
      </AnimatedPanel>

      <AnimatedPanel className="h-fit self-start p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-gap">
          <h2 className="text-text flex items-center gap-2 font-semibold">
            <Baby className="text-cyber-cyan h-5 w-5" />
            Дети
          </h2>
          <span className="text-muted-text text-xs">Профили семьи</span>
        </div>
        <AsyncState
          error={list.error}
          hasData={Boolean(list.data)}
          isLoading={list.isLoading}
          loading={<p className="text-muted-text text-sm">Загрузка…</p>}
          onRetry={() => list.refetch()}
        >
          <div className="grid gap-gap sm:grid-cols-2">
            {(list.data ?? []).map((child) => (
              <article
                className="border-border bg-elevated/30 rounded-2xl border p-4"
                key={child.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    {child.avatarUrl ? (
                      <img
                        alt=""
                        className="border-border h-12 w-12 shrink-0 rounded-2xl border object-cover"
                        loading="lazy"
                        src={child.avatarUrl}
                      />
                    ) : (
                      <div className="border-border bg-surface/60 text-cyber-cyan grid h-12 w-12 shrink-0 place-items-center rounded-2xl border">
                        <Baby aria-hidden="true" className="h-5 w-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="text-text font-medium">
                        {child.firstName} {child.lastName}
                      </h3>
                      <p className="text-muted-text mt-1 text-xs">
                        Рождён(а): {new Date(child.birthDate).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-1">
                    <DownloadLoader
                      aria-label="Экспорт профиля"
                      onClick={() => exportChild(child.id, child.firstName)}
                      size="s"
                      status={exportingId === child.id ? 'loading' : 'idle'}
                    />
                    <Button
                      aria-label="Редактировать профиль"
                      icon={<Pencil className="h-4 w-4" />}
                      onClick={() => {
                        setEditing(child.id);
                        setFirstName(child.firstName);
                        setLastName(child.lastName ?? '');
                        setBirthDate(child.birthDate.slice(0, 10));
                      }}
                      size="s"
                    />
                    <Button
                      aria-label="Удалить профиль"
                      className="text-neon-pink"
                      icon={<Trash2 className="h-4 w-4" />}
                      onClick={() =>
                        setPendingDelete({
                          id: child.id,
                          name: `${child.firstName} ${child.lastName ?? ''}`.trim(),
                        })
                      }
                      size="s"
                    />
                  </div>
                </div>
              </article>
            ))}
            {!list.data?.length && (
              <p className="text-muted-text text-sm">Профили детей ещё не добавлены.</p>
            )}
          </div>
        </AsyncState>
      </AnimatedPanel>
      <ConfirmDialog
        confirmLabel="Удалить профиль"
        description={`Профиль «${pendingDelete?.name ?? ''}» будет удалён без возможности восстановления. Связанные задачи и события сохранятся, но потеряют привязку к профилю.`}
        isLoading={removeState.isLoading}
        onCancel={() => setPendingDelete(null)}
        onConfirm={deleteChild}
        open={Boolean(pendingDelete)}
        title="Удалить профиль ребёнка?"
      />
    </div>
  );
};
