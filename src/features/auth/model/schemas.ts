import dayjs from 'dayjs';
import { z } from 'zod';

const emailSchema = z.string().trim().min(1, 'Введите email').email('Некорректный email');
const passwordSchema = z
  .string()
  .min(8, 'Пароль должен содержать минимум 8 символов')
  .regex(/[A-Za-zА-Яа-я]/, 'Добавьте хотя бы одну букву')
  .regex(/\d/, 'Добавьте хотя бы одну цифру');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Введите пароль'),
});

export const registerSchema = z
  .object({
    birthDate: z.string().refine(
      (value) => {
        const date = dayjs(value);
        return date.isValid() && date.isBefore(dayjs(), 'day');
      },
      { message: 'Укажите корректную дату в прошлом' },
    ),
    confirmPassword: z.string().min(1, 'Повторите пароль'),
    email: emailSchema,
    firstName: z.string().trim().min(2, 'Минимум 2 символа').max(50, 'Максимум 50 символов'),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'NOT_SPECIFIED']),
    lastName: z.string().trim().min(2, 'Минимум 2 символа').max(50, 'Максимум 50 символов'),
    password: passwordSchema,
    phone: z
      .string()
      .trim()
      .regex(/^\+?[1-9]\d{9,14}$/, 'Используйте международный формат, например +79991234567'),
  })
  .refine(({ confirmPassword, password }) => confirmPassword === password, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });

export const restoreSchema = z.object({
  email: emailSchema,
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type RestoreFormValues = z.infer<typeof restoreSchema>;
