import { Check, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';

import {
  getApiErrorMessage,
  useArchiveMutation,
  useCompleteMutation,
  useCreateMutation,
  useListQuery,
  useReopenMutation,
} from '@/shared/api';
import type { TaskResponseDto } from '@/shared/api';
import { AsyncState, Button, Input } from '@/shared/ui';

export const FamilyTasks = () => {
  const tasks = useListQuery({ page: 1, limit: 20 });
  const [createTask, createState] = useCreateMutation();
  const [completeTask] = useCompleteMutation();
  const [reopenTask] = useReopenMutation();
  const [archiveTask] = useArchiveMutation();
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string>();
  const taskItems = ((tasks.data as { data?: TaskResponseDto[] } | undefined)?.data ?? []);

  const refresh = () => tasks.refetch();
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    setError(undefined);
    try {
      await createTask({ createTaskDto: { title: title.trim(), priority: 'NORMAL' } }).unwrap();
      setTitle('');
      refresh();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Не удалось создать задачу'));
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

  return (
    <div className="space-y-3">
      <form className="flex gap-2" onSubmit={submit}>
        <Input aria-label="Название новой задачи" onChange={(event) => setTitle(event.target.value)} placeholder="Добавить семейное дело…" value={title} />
        <Button aria-label="Добавить задачу" disabled={createState.isLoading || !title.trim()} type="submit">
          <Plus aria-hidden="true" className="h-4 w-4" />
        </Button>
      </form>
      {error && <p className="text-neon-pink text-xs">{error}</p>}
      <AsyncState error={tasks.error} errorMessage="Не удалось загрузить задачи" hasData={Boolean(tasks.data)} isLoading={tasks.isLoading} loading={<p className="text-muted-text text-sm">Загружаем дела…</p>} onRetry={refresh}>
        <div className="space-y-2">
          {taskItems.filter((task) => task.status !== 'ARCHIVED').map((task) => (
            <div className="border-border bg-surface/50 flex items-center gap-2 rounded-xl border p-2.5" key={task.id}>
              <button aria-label={task.status === 'COMPLETED' ? 'Вернуть задачу' : 'Завершить задачу'} className="text-acid-green shrink-0" onClick={() => mutate(() => task.status === 'COMPLETED' ? reopenTask({ id: task.id, 'if-match': String(task.version) }).unwrap() : completeTask({ id: task.id, 'if-match': String(task.version) }).unwrap())} type="button">
                {task.status === 'COMPLETED' ? <RotateCcw className="h-4 w-4" /> : <Check className="h-4 w-4" />}
              </button>
              <span className={task.status === 'COMPLETED' ? 'text-muted-text flex-1 text-sm line-through' : 'text-text flex-1 text-sm'}>{task.title}</span>
              <button aria-label="Удалить задачу" className="text-neon-pink/70 hover:text-neon-pink" onClick={() => mutate(() => archiveTask({ id: task.id }).unwrap())} type="button"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          {!taskItems.filter((task) => task.status !== 'ARCHIVED').length && <p className="text-muted-text py-2 text-sm">Дел пока нет.</p>}
        </div>
      </AsyncState>
    </div>
  );
};
