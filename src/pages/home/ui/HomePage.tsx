import { motion, type Variants } from 'motion/react';
import { useNavigate } from 'react-router-dom';

import { Button, ScrambleText } from '@/shared/ui';

const titleWords = ['Привет!', 'My', 'love!'];
const messageWords = [
  'Если',
  'ты',
  'находишься',
  'здесь,',
  'значит',
  'тебе',
  'не',
  'нужно',
  'ничего',
  'объяснять.',
  'Выбирай',
  'действие',
];

const textContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.075,
    },
  },
};

const wordVariants: Variants = {
  hidden: {
    filter: 'blur(12px)',
    opacity: 0,
    textShadow: '0 0 0 rgba(176, 38, 255, 0)',
    y: 24,
  },
  visible: {
    filter: 'blur(0px)',
    opacity: 1,
    textShadow: [
      '0 0 0 rgba(176, 38, 255, 0)',
      '0 0 26px rgba(176, 38, 255, 0.95)',
      '0 0 10px rgba(176, 38, 255, 0.35)',
    ],
    transition: { duration: 0.65, ease: 'easeOut' },
    y: 0,
  },
};

const controlsVariants: Variants = {
  hidden: { filter: 'blur(8px)', opacity: 0, y: 20 },
  visible: {
    filter: 'blur(0px)',
    opacity: 1,
    transition: { delay: 1.5, duration: 0.6, ease: 'easeOut' },
    y: 0,
  },
};

export const HomePage = () => {
  const navigate = useNavigate();

  return (
    <main className="text-text flex min-h-screen items-center justify-center px-6 py-16">
      <div className="mx-auto flex w-full max-w-5xl -translate-y-8 flex-col items-center text-center md:-translate-y-12">
        <motion.h1
          animate="visible"
          aria-label="Привет! My love!"
          className="flex flex-wrap justify-center gap-x-[0.28em] py-3 text-4xl font-black leading-[1.2] tracking-tight md:text-6xl lg:text-7xl"
          initial="hidden"
          variants={textContainerVariants}
        >
          {titleWords.map((word, index) => (
            <motion.span aria-hidden="true" className="pb-1" key={word} variants={wordVariants}>
              <ScrambleText
                className={
                  index === 0
                    ? 'text-text'
                    : 'from-primary-neon via-neon-pink to-cyber-cyan bg-gradient-to-r bg-clip-text text-transparent'
                }
                text={word}
              />
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          animate="visible"
          aria-label="Если ты находишься здесь, значит тебе не нужно ничего объяснять. Выбирай действие"
          className="text-muted-text mt-6 flex max-w-3xl flex-wrap justify-center gap-x-[0.3em] py-2 text-lg font-medium leading-[1.65] md:text-xl"
          initial="hidden"
          variants={textContainerVariants}
        >
          {messageWords.map((word, index) => (
            <motion.span aria-hidden="true" className="pb-0.5" key={word} variants={wordVariants}>
              <ScrambleText
                className={index >= messageWords.length - 2 ? 'text-cyber-cyan' : undefined}
                text={word}
              />
            </motion.span>
          ))}
        </motion.p>

        <motion.div
          animate="visible"
          className="mt-12 gap-40 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row"
          initial="hidden"
          variants={controlsVariants}
        >
          <Button
            animateVariant="magnetic"
            className="min-w-48"
            containerClassName="w-full justify-center sm:w-auto"
            onClick={() => navigate('/login')}
          >
            Войти
          </Button>
          <Button
            animateVariant="base"
            className="min-w-48"
            containerClassName="w-full justify-center sm:w-auto"
            onClick={() => navigate('/auth')}
          >
            Зарегистрироваться
          </Button>
        </motion.div>
      </div>
    </main>
  );
};
