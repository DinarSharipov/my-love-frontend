import { Check, Edit3, ListChecks, Plus, RotateCcw, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import {
  getApiErrorMessage,
  useArchiveMutation,
  useCompleteMutation,
  useCreateMutation,
  useListQuery,
  useReopenMutation,
  useUpdateMutation,
} from '@/shared/api';
import type { TaskResponseDto } from '@/shared/api';
import { AnimatedPanel, AsyncState, Button, Input, Select, Textarea } from '@/shared/ui';

type Filter = 'ALL' | 'OPEN' | 'COMPLETED';
type TaskList = { data?: TaskResponseDto[] };
const options = [
  { label: 'Низкий', value: 'LOW' },
  { label: 'Обычный', value: 'NORMAL' },
  { label: 'Высокий', value: 'HIGH' },
];
const filterLabels: Record<Filter, string> = { ALL: 'Все', OPEN: 'Открытые', COMPLETED: 'Завершённые' };
export const TasksPage = () => {
  const list = useListQuery({ page: 1, limit: 100 });
  const [createTask, createState] = useCreateMutation();
  const [updateTask, updateState] = useUpdateMutation();
  const [completeTask] = useCompleteMutation();
  const [reopenTask] = useReopenMutation();
  const [archiveTask] = useArchiveMutation();
  const [filter, setFilter] = useState<Filter>('ALL');
  const [editing, setEditing] = useState<TaskResponseDto | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'NORMAL' | 'HIGH'>('NORMAL');
  const [error, setError] = useState<string>();
  const tasks = ((list.data as TaskList | undefined)?.data ?? []).filter(
    (task) => task.status !== 'ARCHIVED',
  );
  const visible = useMemo(
    () => (filter === 'ALL' ? tasks : tasks.filter((task) => task.status === filter)),
    [filter, tasks],
  );
  const refresh = () => list.refetch();
  const resetForm = () => {
    setEditing(null);
    setTitle('');
    setDescription('');
    setDueAt('');
    setPriority('NORMAL');
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(undefined);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
        priority,
      };
      if (editing)
        await updateTask({
          id: editing.id,
          'if-match': String(editing.version),
          updateTaskDto: payload,
        }).unwrap();
      else await createTask({ createTaskDto: payload }).unwrap();
      resetForm();
      refresh();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Не удалось сохранить задачу'));
    }
  };
  const mutate = async (action: () => Promise<unknown>) => {
    setError(undefined);
    try {
      await action();
      refresh();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Не удалось обновить задачу'));
    }
  };
  const startEdit = (task: TaskResponseDto) => {
    setEditing(task);
    setTitle(task.title);
    setDescription(typeof task.description === 'string' ? task.description : '');
    setDueAt(task.dueAt ? String(task.dueAt).slice(0, 16) : '');
    setPriority(task.priority);
  };
  return (
    <main className="h-full overflow-auto pb-24">
      <div className="mx-auto w-full max-w-4xl space-y-5">
        <header>
          <p className="text-cyber-cyan text-xs font-semibold uppercase tracking-[0.2em]">
            Семейный cockpit
          </p>
          <h1 className="text-text mt-1 text-2xl font-semibold sm:text-3xl">Задачи и дела</h1>
          <p className="text-muted-text mt-1 text-sm">
            Собирайте бытовые дела в одном понятном списке.
          </p>
        </header>
        <AnimatedPanel className="p-5 sm:p-6">
          <form className="space-y-4" onSubmit={submit}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-text flex items-center gap-2 font-semibold">
                <ListChecks className="text-cyber-cyan h-5 w-5" />
                {editing ? 'Редактирование задачи' : 'Новая задача'}
              </h2>
              {editing && (
                <Button onClick={resetForm} size="s">
                  <X className="h-4 w-4" />
                  Отмена
                </Button>
              )}
            </div>
            <Input
              label="Название"
              onChange={(event) => setTitle(event.target.value)}
              required
              value={title}
            />
            <Textarea
              label="Описание"
              onChange={(event) => setDescription(event.target.value)}
              value={description}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Срок"
                onChange={(event) => setDueAt(event.target.value)}
                type="datetime-local"
                value={dueAt}
              />
              <Select
                label="Приоритет"
                onChange={(value) => setPriority(value as typeof priority)}
                options={options}
                value={priority}
              />
            </div>
            {error && (
              <p className="text-neon-pink text-sm" role="alert">
                {error}
              </p>
            )}
            <Button
              disabled={!title.trim() || createState.isLoading || updateState.isLoading}
              type="submit"
            >
              <Plus className="h-4 w-4" />
              {editing ? 'Сохранить изменения' : 'Добавить задачу'}
            </Button>
          </form>
        </AnimatedPanel>
        <AnimatedPanel className="p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-text font-semibold">Список задач</h2>
            <div className="flex gap-2">
              {(['ALL', 'OPEN', 'COMPLETED'] as Filter[]).map((value) => (
                <Button
                  key={value}
                  onClick={() => setFilter(value)}
                  size="s"
                  className={filter === value ? 'border-primary-neon text-primary-neon' : ''}
                >
                  {filterLabels[value]}
                </Button>
              ))}
            </div>
          </div>
          <AsyncState
            error={list.error}
            errorMessage="Не удалось загрузить задачи"
            hasData={Boolean(list.data)}
            isLoading={list.isLoading}
            loading={<p className="text-muted-text text-sm">Загружаем задачи…</p>}
            onRetry={refresh}
          >
            <div className="space-y-2">
              {visible.map((task) => (
                <article
                  className="border-border bg-elevated/35 flex flex-wrap items-center gap-3 rounded-2xl border p-3"
                  key={task.id}
                >
                  <button
                    aria-label={task.status === 'COMPLETED' ? 'Вернуть задачу' : 'Завершить задачу'}
                    className="text-acid-green"
                    onClick={() =>
                      mutate(() =>
                        task.status === 'COMPLETED'
                          ? reopenTask({ id: task.id, 'if-match': String(task.version) }).unwrap()
                          : completeTask({
                              id: task.id,
                              'if-match': String(task.version),
                            }).unwrap(),
                      )
                    }
                    type="button"
                  >
                    {task.status === 'COMPLETED' ? (
                      <RotateCcw className="h-4 w-4" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p
                      className={
                        task.status === 'COMPLETED'
                          ? 'text-muted-text truncate text-sm line-through'
                          : 'text-text truncate text-sm'
                      }
                    >
                      {task.title}
                    </p>
                    {task.dueAt && (
                      <p className="text-muted-text mt-1 text-xs">
                        Срок: {new Date(String(task.dueAt)).toLocaleString('ru-RU')}
                      </p>
                    )}
                  </div>
                  <Button
                    aria-label="Редактировать задачу"
                    onClick={() => startEdit(task)}
                    size="s"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    aria-label="Архивировать задачу"
                    className="text-neon-pink"
                    onClick={() => mutate(() => archiveTask({ id: task.id }).unwrap())}
                    size="s"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </article>
              ))}
              {!visible.length && (
                <p className="text-muted-text py-5 text-center text-sm">
                  В этом фильтре задач нет.
                </p>
              )}
            </div>
          </AsyncState>
        </AnimatedPanel>
      </div>
    </main>
  );
};
