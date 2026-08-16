import dayjs from 'dayjs';
import { z } from 'zod';

import { toFamilyEventInstant } from '@/features/family-events/lib/familyEventDate';

const isCalendarDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const familyEventBaseSchema = z.object({
  date: z.string().refine(isCalendarDate, 'Укажите корректную дату'),
  description: z.string().trim().max(2000, 'Максимум 2000 символов'),
  location: z.string().trim().min(1, 'Укажите место').max(500, 'Максимум 500 символов'),
  name: z.string().trim().min(1, 'Введите название').max(200, 'Максимум 200 символов'),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Укажите корректное время'),
  reminderOffsetMinutes: z.number().int().min(1).max(525600).nullable(),
  reminderRecipientIds: z.array(z.string().uuid()),
  repeatReminderAt: z.string().nullable(),
});

export const createFamilyEventSchema = (timeZone: string) =>
  familyEventBaseSchema.superRefine((value, context) => {
    if (!isCalendarDate(value.date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value.time)) {
      return;
    }

    if (!dayjs(toFamilyEventInstant(value.date, value.time, timeZone)).isAfter(dayjs())) {
      context.addIssue({
        code: 'custom',
        message: 'Событие должно быть в будущем',
        path: ['date'],
      });
    }
  });

export type FamilyEventFormValues = z.infer<typeof familyEventBaseSchema>;
