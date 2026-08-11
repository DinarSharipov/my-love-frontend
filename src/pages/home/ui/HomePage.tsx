import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { upperFirst } from 'lodash';
import { motion } from 'motion/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { welcomeSchema, type WelcomeFormValues } from '@/pages/home/model/welcomeSchema';
import { Button, Input } from '@/shared/ui';

dayjs.locale('ru');

export const HomePage = () => {
  const [visitorName, setVisitorName] = useState('друг');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WelcomeFormValues>({
    resolver: zodResolver(welcomeSchema),
    defaultValues: { name: '' },
  });

  const submitForm = ({ name }: WelcomeFormValues) => {
    setVisitorName(upperFirst(name.trim()));
  };

  return (
    <main className="bg-background/35 text-text flex min-h-screen items-center justify-center px-6 py-12">
      <motion.section
        animate={{ opacity: 1, y: 0 }}
        className="border-border bg-surface/90 w-full max-w-xl rounded-3xl border p-8 shadow-2xl backdrop-blur-md md:p-12"
        initial={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <p className="text-neon-pink mb-3 text-sm font-semibold uppercase tracking-[0.25em]">
          {dayjs().format('D MMMM YYYY')}
        </p>
        <h1 className="text-4xl font-bold tracking-tight md:text-6xl">Привет, {visitorName}!</h1>
        <p className="text-muted-text mt-5 text-lg leading-8">
          Это стартовая страница нового приложения. Основа уже готова — теперь проект можно уверенно
          расширять по архитектуре FSD.
        </p>

        <form className="mt-8 flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit(submitForm)}>
          <div className="flex-1">
            <Input
              error={errors.name?.message}
              id="name"
              label="Ваше имя"
              placeholder="Как вас зовут?"
              {...register('name')}
            />
          </div>
          <Button animateVariant="magnetic" className="h-12" type="submit">
            Поздороваться
          </Button>
        </form>
      </motion.section>
    </main>
  );
};
