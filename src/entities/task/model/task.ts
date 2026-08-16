export type CalendarTask = {
  dueAt: string;
  id: string;
  status: string;
  title: string;
};

const isCalendarTask = (value: unknown): value is CalendarTask => {
  if (typeof value !== 'object' || value === null) return false;
  const task = value as Record<string, unknown>;

  return (
    typeof task.id === 'string' &&
    typeof task.title === 'string' &&
    typeof task.status === 'string' &&
    typeof task.dueAt === 'string'
  );
};

/** Normalize the currently untyped tasks endpoint response for calendar consumers. */
export const getCalendarTasks = (response: unknown): CalendarTask[] => {
  if (typeof response !== 'object' || response === null || !('data' in response)) return [];

  const { data } = response as { data?: unknown };
  return Array.isArray(data)
    ? data.filter(isCalendarTask).filter((task) => task.status !== 'ARCHIVED')
    : [];
};
