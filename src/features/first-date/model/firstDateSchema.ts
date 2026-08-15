import { z } from 'zod';

const isCalendarDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

export const firstDateSchema = z.object({
  date: z.string().refine(isCalendarDate, 'Укажите корректную дату'),
  description: z.string().trim().max(2000, 'Максимум 2000 символов'),
  name: z.string().trim().min(1, 'Введите название').max(200, 'Максимум 200 символов'),
});

export type FirstDateFormValues = z.infer<typeof firstDateSchema>;
