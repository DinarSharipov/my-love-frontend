import { z } from 'zod';

export const privateInvitationSchema = z.object({
  recipientEmail: z
    .string()
    .trim()
    .min(1, 'Введите email партнёра')
    .email('Некорректный email')
    .max(320, 'Максимум 320 символов'),
});

export type PrivateInvitationFormValues = z.infer<typeof privateInvitationSchema>;
