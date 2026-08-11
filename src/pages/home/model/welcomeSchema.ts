import { z } from 'zod';

export const welcomeSchema = z.object({
  name: z.string().trim().min(2, 'Введите не менее двух символов').max(40),
});

export type WelcomeFormValues = z.infer<typeof welcomeSchema>;
