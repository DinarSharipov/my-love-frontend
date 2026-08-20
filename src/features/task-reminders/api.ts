import { baseApi } from '@/shared/api/baseApi';

export type TaskReminder = {
  id: string;
  taskId: string;
  userId: string;
  remindAt: string;
  sentAt: string | null;
  createdAt: string;
};
export type TaskReminderInput = { remindAt: string };
const remindersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createTaskReminder: build.mutation<TaskReminder, { taskId: string } & TaskReminderInput>({
      query: ({ taskId, ...body }) => ({
        url: `/api/v1/families/me/tasks/${taskId}/reminders`,
        method: 'POST',
        body,
      }),
    }),
    listTaskReminders: build.query<TaskReminder[], string>({
      query: (taskId) => `/api/v1/families/me/tasks/${taskId}/reminders`,
    }),
    deleteTaskReminder: build.mutation<void, string>({
      query: (id) => ({ url: `/api/v1/families/me/tasks/reminders/${id}`, method: 'DELETE' }),
    }),
  }),
});
export const {
  useCreateTaskReminderMutation,
  useListTaskRemindersQuery,
  useDeleteTaskReminderMutation,
} = remindersApi;
