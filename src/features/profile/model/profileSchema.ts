import { z } from 'zod';

const optionalPhoneSchema = z
  .string()
  .trim()
  .refine(
    (value) => value.length === 0 || /^\+?[1-9]\d{9,14}$/.test(value),
    'Используйте международный формат, например +79991234567',
  );

const timeZoneSchema = z
  .string()
  .trim()
  .min(1, 'Укажите часовой пояс')
  .refine((value) => {
    try {
      Intl.DateTimeFormat('en-US', { timeZone: value }).format();
      return true;
    } catch {
      return false;
    }
  }, 'Используйте IANA-формат, например Europe/Moscow');

export const profileSchema = z.object({
  description: z.string().trim().max(2000, 'Максимум 2000 символов'),
  firstName: z.string().trim().min(1, 'Введите имя').max(100, 'Максимум 100 символов'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'NOT_SPECIFIED']),
  lastName: z.string().trim().min(1, 'Введите фамилию').max(100, 'Максимум 100 символов'),
  locale: z.string().trim().min(2, 'Минимум 2 символа').max(35, 'Максимум 35 символов'),
  phone: optionalPhoneSchema,
  timeZone: timeZoneSchema,
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
