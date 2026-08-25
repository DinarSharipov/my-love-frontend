import { Archive, CalendarClock, Play, Plus, RefreshCw, RotateCcw, UserRound } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';

import {
  getApiErrorMessage,
  useArchive2Mutation,
  useCreate2Mutation,
  useFindMyFamilyQuery,
  useGenerateMutation,
  useListArchivedQuery,
  useList14Query,
  useList2Query,
  useRestoreMutation,
} from '@/shared/api';
import {
  AnimatedPanel,
  AsyncState,
  Button,
  DatePicker,
  Input,
  Select,
  Textarea,
} from '@/shared/ui';

const priorities = [
  { label: 'Низкий', value: 'LOW' },
  { label: 'Обычный', value: 'NORMAL' },
  { label: 'Высокий', value: 'HIGH' },
];

export const TaskRoutinesPage = () => {
  const [showArchived, setShowArchived] = useState(false);
  const activeList = useList2Query(undefined, { skip: showArchived });
  const archivedList = useListArchivedQuery(undefined, { skip: !showArchived });
  const list = showArchived ? archivedList : activeList;
  const family = useFindMyFamilyQuery();
  const children = useList14Query();
  const [createRoutine, createState] = useCreate2Mutation();
  const [generateTask] = useGenerateMutation();
  const [archiveRoutine] = useArchive2Mutation();
  const [restoreRoutine] = useRestoreMutation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'NORMAL' | 'HIGH'>('NORMAL');
  const [frequency, setFrequency] = useState<'DAILY' | 'WEEKLY'>('WEEKLY');
  const [intervalValue, setIntervalValue] = useState('1');
  const [nextRunAt, setNextRunAt] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [childId, setChildId] = useState('');
  const [childFilter, setChildFilter] = useState('');
  const [error, setError] = useState<string>();

  const routines = (list.data ?? []).filter(
    (routine) => !childFilter || (routine.childId as unknown as string) === childFilter,
  );
  const childNames = new Map(
    (children.data ?? []).map((child) => [
      child.id,
      `${child.firstName} ${typeof child.lastName === 'string' ? child.lastName : ''}`.trim(),
    ]),
  );
  const childOptions = [
    { label: 'Общая рутина', value: '' },
    ...(children.data ?? []).map((child) => ({
      label:
        `${child.firstName} ${typeof child.lastName === 'string' ? child.lastName : ''}`.trim(),
      value: child.id,
    })),
  ];
  const assigneeOptions = [
    { label: 'Свободная задача', value: '' },
    ...(family.data?.members ?? []).map(({ user }) => ({
      label: `${user.firstName} ${user.lastName}`,
      value: user.id,
    })),
  ];
  const assigneeNames = new Map(
    (family.data?.members ?? []).map(({ user }) => [user.id, `${user.firstName} ${user.lastName}`]),
  );
  const reset = () => {
    setTitle('');
    setDescription('');
    setPriority('NORMAL');
    setFrequency('WEEKLY');
    setIntervalValue('1');
    setNextRunAt('');
    setAssignedToId('');
    setChildId('');
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(undefined);
    try {
      await createRoutine({
        createTaskRoutineDto: {
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
          frequency,
          interval: Math.max(1, Number(intervalValue) || 1),
          nextRunAt: new Date(nextRunAt).toISOString(),
          assignedToId: assignedToId || null,
          childId: childId || null,
        },
      }).unwrap();
      reset();
      await list.refetch();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Не удалось создать регулярную задачу'));
    }
  };
  const action = async (run: () => Promise<unknown>, message: string) => {
    setError(undefined);
    try {
      await run();
      await list.refetch();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, message));
    }
  };
  return (
    <main className="h-full overflow-auto p-5">
      <div className="mx-auto w-full space-y-5">
        <AnimatedPanel className="page-header">
          <p className="text-cyber-cyan text-xs font-semibold uppercase tracking-[0.2em]">
            Автоматизация быта
          </p>
          <h1 className="text-text mt-1 text-2xl font-semibold sm:text-3xl">Регулярные задачи</h1>
          <p className="text-muted-text mt-1 text-sm">
            Шаблоны дел, которые можно создавать по расписанию.
          </p>
          <div className="mt-4">
            <Button onClick={() => setShowArchived((value) => !value)} size="s">
              {showArchived ? '?????????? ????????????' : '?????????? ??????????'}
            </Button>
          </div>
        </AnimatedPanel>
        {!showArchived && (
          <AnimatedPanel className="p-5">
            <form className="grid gap-gap md:grid-cols-2" onSubmit={submit}>
              <Input
                label="Название"
                onChange={(event) => setTitle(event.target.value)}
                required
                value={title}
              />
              <Select
                label="Приоритет"
                onChange={(value) => setPriority(value as typeof priority)}
                options={priorities}
                value={priority}
              />
              <Textarea
                className="md:col-span-2"
                label="Описание"
                onChange={(event) => setDescription(event.target.value)}
                value={description}
              />
              <Select
                label="Периодичность"
                onChange={(value) => setFrequency(value as typeof frequency)}
                options={[
                  { label: 'Каждый день', value: 'DAILY' },
                  { label: 'Каждую неделю', value: 'WEEKLY' },
                ]}
                value={frequency}
              />
              <Input
                label="Интервал"
                min="1"
                onChange={(event) => setIntervalValue(event.target.value)}
                type="number"
                value={intervalValue}
              />
              <DatePicker
                label="Следующий запуск"
                onChange={(event) => setNextRunAt(event.target.value)}
                required
                value={nextRunAt}
                withTime
              />
              <Select
                label="Исполнитель"
                onChange={setAssignedToId}
                options={assigneeOptions}
                value={assignedToId}
              />
              <Select
                label="Для кого"
                onChange={setChildId}
                options={childOptions}
                value={childId}
              />
              <div className="md:col-span-2">
                <Button
                  disabled={createState.isLoading || !title.trim() || !nextRunAt}
                  type="submit"
                >
                  <span className="inline-flex items-center">
                    <Plus className="size-4" />
                    Создать правило
                  </span>
                </Button>
              </div>
            </form>
            {error && <p className="text-neon-pink mt-3 text-sm">{error}</p>}
          </AnimatedPanel>
        )}
        <AsyncState
          error={list.error}
          hasData={Boolean(list.data)}
          isLoading={list.isLoading}
          loading={<AnimatedPanel className="p-5">Загрузка регулярных задач…</AnimatedPanel>}
          onRetry={() => {
            list.refetch();
          }}
          empty={
            !list.isLoading && routines.length === 0 ? (
              <AnimatedPanel className="text-muted-text p-6 text-center">
                Регулярных задач пока нет.
              </AnimatedPanel>
            ) : undefined
          }
        >
          <div className="mb-4 max-w-xs">
            <Select
              label="Фильтр по ребёнку"
              onChange={setChildFilter}
              options={childOptions}
              value={childFilter}
            />
          </div>
          <div className="grid gap-gap md:grid-cols-2">
            {routines.map((routine) => (
              <AnimatedPanel className="p-5" key={routine.id}>
                <div className="flex items-start justify-between gap-gap">
                  <div className="min-w-0">
                    <h2 className="text-text truncate font-semibold">{routine.title}</h2>
                    <p className="text-muted-text mt-1 text-xs">
                      {routine.frequency === 'DAILY' ? 'Каждый день' : 'Каждую неделю'} · интервал{' '}
                      {routine.interval}
                    </p>
                  </div>
                  <CalendarClock className="text-primary-neon size-5 shrink-0" />
                </div>
                {routine.description && (
                  <p className="text-muted-text mt-3 text-sm">{String(routine.description)}</p>
                )}
                <p className="text-muted-text mt-3 text-xs">
                  Следующий запуск: {new Date(routine.nextRunAt).toLocaleString('ru-RU')}
                </p>
                <p className="text-muted-text mt-2 flex items-center gap-gap text-xs">
                  <UserRound aria-hidden="true" className="size-3.5" />
                  {typeof routine.assignedToId === 'string'
                    ? (assigneeNames.get(routine.assignedToId) ?? 'Участник семьи')
                    : 'Свободная задача'}
                </p>
                {typeof routine.childId === 'string' && (
                  <p className="text-cyber-cyan mt-2 text-xs">
                    Ребёнок: {childNames.get(routine.childId) ?? 'Профиль'}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-gap">
                  <Button
                    onClick={() =>
                      action(
                        () => generateTask({ id: routine.id }).unwrap(),
                        'Не удалось создать задачу',
                      )
                    }
                    size="s"
                  >
                    <span className="inline-flex items-center">
                      <Play className="size-3.5 mr-2" />
                      Создать сейчас
                    </span>
                  </Button>
                  <Button
                    onClick={() =>
                      action(
                        () =>
                          (showArchived
                            ? restoreRoutine({ id: routine.id })
                            : archiveRoutine({ id: routine.id })
                          ).unwrap(),
                        'Не удалось архивировать правило',
                      )
                    }
                    size="s"
                  >
                    <span className="inline-flex items-center">
                      {showArchived ? (
                        <RotateCcw className="size-3.5 mr-2" />
                      ) : (
                        <Archive className="size-3.5 mr-2" />
                      )}
                      Архивировать
                    </span>
                  </Button>
                </div>
              </AnimatedPanel>
            ))}
          </div>
        </AsyncState>
        {list.isFetching && !list.isLoading && (
          <p className="text-muted-text flex items-center gap-gap text-xs">
            <RefreshCw className="size-3.5 animate-spin" />
            Обновление…
          </p>
        )}
      </div>
    </main>
  );
};
