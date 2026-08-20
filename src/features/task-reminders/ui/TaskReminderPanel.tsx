import { Bell, BellOff } from 'lucide-react';
import { useState } from 'react';

import {
  useCreateTaskReminderMutation,
  useDeleteTaskReminderMutation,
  useListTaskRemindersQuery,
} from '@/features/task-reminders/api';
import { Button, DatePicker } from '@/shared/ui';

export const TaskReminderPanel = ({ taskId }: { taskId: string }) => {
  const list = useListTaskRemindersQuery(taskId);
  const [create] = useCreateTaskReminderMutation();
  const [remove] = useDeleteTaskReminderMutation();
  const [remindAt, setRemindAt] = useState('');
  const reminder = list.data?.[0];
  return (
    <div className="mt-2 flex flex-wrap items-end gap-2">
      <DatePicker
        aria-label="Время напоминания"
        label="Напомнить"
        onChange={(event) => setRemindAt(event.target.value)}
        value={remindAt}
        withTime
      />
      <Button
        disabled={!remindAt}
        icon={<Bell className="h-4 w-4" />}
        onClick={async () => {
          await create({ taskId, remindAt: new Date(remindAt).toISOString() }).unwrap();
          setRemindAt('');
          list.refetch();
        }}
        size="s"
      >
        {reminder ? 'Обновить' : 'Поставить'}
      </Button>
      {reminder && (
        <Button
          className="text-neon-pink"
          icon={<BellOff className="h-4 w-4" />}
          onClick={async () => {
            await remove(reminder.id).unwrap();
            list.refetch();
          }}
          size="s"
        >
          {new Date(reminder.remindAt).toLocaleString('ru-RU')}
        </Button>
      )}
    </div>
  );
};
