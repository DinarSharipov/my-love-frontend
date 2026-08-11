import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { upperFirst } from 'lodash';
import { motion } from 'motion/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { welcomeSchema, type WelcomeFormValues } from '@/pages/home/model/welcomeSchema';

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
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-slate-100">
      <motion.section
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur md:p-12"
        initial={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-fuchsia-300">
          {dayjs().format('D MMMM YYYY')}
        </p>
        <h1 className="text-4xl font-bold tracking-tight md:text-6xl">Привет, {visitorName}!</h1>
        <p className="mt-5 text-lg leading-8 text-slate-300">
          Это стартовая страница нового приложения. Основа уже готова — теперь проект можно уверенно
          расширять по архитектуре FSD.
        </p>

        <form className="mt-8 flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit(submitForm)}>
          <div className="flex-1">
            <label className="block" htmlFor="name">
              <span className="sr-only">Ваше имя</span>
              <input
                id="name"
                className="w-full rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 outline-none transition focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-400/30"
                placeholder="Как вас зовут?"
                {...register('name')}
              />
            </label>
            {errors.name && (
              <p className="mt-2 text-sm text-rose-300" role="alert">
                {errors.name.message}
              </p>
            )}
          </div>
          <motion.button
            className="h-12 rounded-xl bg-fuchsia-500 px-6 font-semibold text-white transition hover:bg-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-300"
            type="submit"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Поздороваться
          </motion.button>
        </form>
      </motion.section>
    </main>
  );
};
