import { Baby, Download, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';

import {
  useCreateChildProfileMutation,
  useDeleteChildProfileMutation,
  useLazyExportChildProfileQuery,
  useListChildProfilesQuery,
  useUpdateChildProfileMutation,
} from '@/entities/child';
import { AnimatedPanel, AsyncState, Button, DatePicker, Input } from '@/shared/ui';

export const ChildProfilesPanel = () => {
  const list = useListChildProfilesQuery();
  const [create] = useCreateChildProfileMutation();
  const [update] = useUpdateChildProfileMutation();
  const [remove] = useDeleteChildProfileMutation();
  const [exportProfile] = useLazyExportChildProfileQuery();
  const [editing, setEditing] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [actionError, setActionError] = useState<string>();

  const reset = () => {
    setEditing(null);
    setFirstName('');
    setLastName('');
    setBirthDate('');
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setActionError(undefined);
    if (!firstName.trim() || !birthDate) return;
    try {
      if (editing)
        await update({
          id: editing,
          firstName: firstName.trim(),
          lastName: lastName.trim() || undefined,
          birthDate,
        }).unwrap();
      else
        await create({
          firstName: firstName.trim(),
          lastName: lastName.trim() || undefined,
          birthDate,
        }).unwrap();
      reset();
      list.refetch();
    } catch {
      setActionError('Не удалось сохранить профиль ребёнка');
    }
  };
  const exportChild = async (childId: string, childName: string) => {
    setActionError(undefined);
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
    }
  };
  return (
    <AnimatedPanel className="p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-gap">
        <h2 className="text-text flex items-center gap-2 font-semibold">
          <Baby className="text-cyber-cyan h-5 w-5" />
          Дети
        </h2>
        <span className="text-muted-text text-xs">Профили семьи</span>
      </div>
      <form
        className="mb-5 grid gap-gap sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end"
        onSubmit={submit}
      >
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
        <div className="flex gap-2">
          <Button
            icon={editing ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            type="submit"
          >
            {editing ? 'Сохранить' : 'Добавить'}
          </Button>
          {editing && <Button icon={<X className="h-4 w-4" />} onClick={reset} type="button" />}
        </div>
      </form>
      {actionError && (
        <p className="text-neon-pink mb-4 text-sm" role="alert">
          {actionError}
        </p>
      )}
      <AsyncState
        error={list.error}
        hasData={Boolean(list.data)}
        isLoading={list.isLoading}
        loading={<p className="text-muted-text text-sm">Загрузка…</p>}
        onRetry={() => list.refetch()}
      >
        <div className="grid gap-gap sm:grid-cols-2">
          {(list.data ?? []).map((child) => (
            <article className="border-border bg-elevated/30 rounded-2xl border p-4" key={child.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-text font-medium">
                    {child.firstName} {child.lastName}
                  </h3>
                  <p className="text-muted-text mt-1 text-xs">
                    Рождён(а): {new Date(child.birthDate).toLocaleDateString('ru-RU')}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    aria-label="Экспорт профиля"
                    icon={<Download className="h-4 w-4" />}
                    onClick={() => exportChild(child.id, child.firstName)}
                    size="s"
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
                    onClick={async () => {
                      await remove(child.id).unwrap();
                      list.refetch();
                    }}
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
  );
};
