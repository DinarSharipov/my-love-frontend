import { z } from 'zod';

export const changePasswordSchema = z
  .object({
    confirmPassword: z.string().min(1, 'Повторите новый пароль'),
    currentPassword: z.string().min(1, 'Введите текущий пароль'),
    newPassword: z
      .string()
      .min(8, 'Новый пароль должен содержать минимум 8 символов')
      .max(128, 'Максимум 128 символов'),
  })
  .refine(({ currentPassword, newPassword }) => currentPassword !== newPassword, {
    message: 'Новый пароль должен отличаться от текущего',
    path: ['newPassword'],
  })
  .refine(({ confirmPassword, newPassword }) => confirmPassword === newPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
