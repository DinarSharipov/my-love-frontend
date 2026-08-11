import { motion } from 'motion/react';
import { useSelector } from 'react-redux';

import { selectCurrentUser } from '@/entities/user';

export const MainPage = () => {
  const user = useSelector(selectCurrentUser);
  const greeting = user ? `${user.firstName}, ты внутри` : 'Добро пожаловать';

  return (
    <main className="bg-background text-text relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      <motion.div
        animate={{ opacity: [0.2, 0.45, 0.2], scale: [0.9, 1.08, 0.9] }}
        aria-hidden="true"
        className="bg-primary-neon/25 pointer-events-none absolute h-[34rem] w-[34rem] rounded-full blur-[150px]"
        transition={{ duration: 8, ease: 'easeInOut', repeat: Infinity }}
      />
      <motion.section
        animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
        className="relative text-center"
        initial={{ filter: 'blur(12px)', opacity: 0, y: 24 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <p className="text-cyber-cyan mb-3 text-xs font-semibold tracking-[0.4em] uppercase">
          Main space
        </p>
        <h1 className="from-primary-neon via-neon-pink to-cyber-cyan bg-gradient-to-r bg-clip-text text-4xl font-black text-transparent sm:text-6xl">
          {greeting}
        </h1>
        <p className="text-muted-text mt-5">Это отдельное пространство приложения.</p>
      </motion.section>
    </main>
  );
};
