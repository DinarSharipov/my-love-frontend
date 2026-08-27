import { motion, type Variants } from 'motion/react';
import { useNavigate } from 'react-router-dom';

import { Button, ScrambleText } from '@/shared/ui';

const withStableKeys = (words: string[], prefix: string) =>
  words.map((text, index) => ({ id: `${prefix}-${index}`, text }));

const titleLines = [
  withStableKeys(['Всё,', 'что', 'делает', 'вас', 'ближе'], 'title-first'),
  withStableKeys(['в', 'одном', 'месте'], 'title-second'),
];
const messageWords = withStableKeys(
  [
    'Общие',
    'планы,',
    'настроение,',
    'события,',
    'воспоминания',
    'и',
    'маленькие',
    'семейные',
    'традиции.',
    'My Love',
    'помогает',
    'лучше',
    'понимать',
    'друг',
    'друга',
    'и',
    'находить',
    'больше',
    'времени',
    'на',
    'главное.',
  ],
  'message',
);
const endMessageWords = withStableKeys(
  ['Ваша', 'семейная', 'история', 'начинается', 'здесь.'],
  'end',
);

const textContainerVariants: Variants = {
  hidden: {},
  visible: { transition: { delayChildren: 0.2, staggerChildren: 0.06 } },
};

const wordVariants: Variants = {
  hidden: {
    filter: 'blur(10px)',
    opacity: 0,
    scale: 0.9,
    textShadow: '0 0 0 rgba(176, 38, 255, 0)',
    y: 42,
  },
  visible: {
    filter: 'blur(0px)',
    opacity: 1,
    scale: 1,
    textShadow: [
      '0 0 0 rgba(176, 38, 255, 0)',
      '0 0 18px rgba(176, 38, 255, 0.7)',
      '0 0 8px rgba(176, 38, 255, 0.25)',
    ],
    transition: { damping: 17, mass: 0.7, stiffness: 240, type: 'spring' },
    y: 0,
  },
};

const controlsVariants: Variants = {
  hidden: { filter: 'blur(5px)', opacity: 0, y: 14 },
  visible: {
    filter: 'blur(0px)',
    opacity: 1,
    transition: { delay: 1.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    y: 0,
  },
};

export const HomePage = () => {
  const navigate = useNavigate();

  return (
    <main className="text-text flex min-h-screen items-center justify-center px-6 py-12 sm:py-16">
      <div className="home-page-hero flex w-full max-w-6xl flex-col items-center text-center">
        <motion.h1
          animate="visible"
          aria-label="Всё, что делает вас ближе в одном месте"
          className="flex max-w-5xl flex-wrap justify-center gap-x-[0.28em] py-3 text-4xl font-black leading-[1.12] tracking-tight drop-shadow-[0_0_24px_rgba(255,255,255,0.22)] sm:text-5xl md:text-6xl lg:text-7xl"
          initial="hidden"
          variants={textContainerVariants}
        >
          {titleLines.map((line, lineIndex) => (
            <span className="flex flex-wrap justify-center gap-x-[0.28em]" key={line[0].id}>
              {line.map(({ id, text }) => (
                <motion.span aria-hidden="true" className="pb-1" key={id} variants={wordVariants}>
                  <ScrambleText
                    className={
                      lineIndex === 0
                        ? 'text-text'
                        : 'from-primary-neon via-neon-pink to-cyber-cyan bg-gradient-to-r bg-clip-text text-transparent'
                    }
                    text={text}
                  />
                </motion.span>
              ))}
            </span>
          ))}
        </motion.h1>

        <motion.p
          animate="visible"
          aria-label="Общие планы, настроение, события, воспоминания и маленькие семейные традиции. My Love помогает лучше понимать друг друга и находить больше времени на главное."
          className="text-text/90 mt-8 flex w-full max-w-4xl flex-wrap items-baseline justify-center gap-x-[0.3em] py-2 text-lg font-medium leading-[1.65] drop-shadow-[0_2px_12px_rgba(7,8,20,0.9)] md:text-xl"
          initial="hidden"
          variants={textContainerVariants}
        >
          {messageWords.map(({ id, text }) => (
            <motion.span aria-hidden="true" className="pb-0.5" key={id} variants={wordVariants}>
              {text === 'My Love' ? (
                <span className="from-primary-neon via-neon-pink to-neon-pink inline-flex items-baseline whitespace-nowrap bg-gradient-to-r bg-clip-text pb-1 text-2xl font-black leading-[1.25] text-transparent drop-shadow-[0_0_18px_rgba(218,38,255,0.6)] sm:text-3xl md:text-4xl">
                  <ScrambleText text="My" />
                  <span aria-hidden="true">&nbsp;</span>
                  <ScrambleText text="Love" />
                </span>
              ) : (
                <ScrambleText text={text} />
              )}
            </motion.span>
          ))}
        </motion.p>

        <motion.p
          animate="visible"
          aria-label="Ваша семейная история начинается здесь."
          className="text-cyber-cyan flex w-full max-w-3xl flex-wrap justify-center gap-x-[0.3em] py-2 text-lg font-semibold leading-[1.65] drop-shadow-[0_0_14px_rgba(0,229,255,0.55)] md:text-xl"
          initial="hidden"
          variants={textContainerVariants}
        >
          {endMessageWords.map(({ id, text }) => (
            <motion.span aria-hidden="true" className="pb-0.5" key={id} variants={wordVariants}>
              <ScrambleText className="text-cyber-cyan" text={text} />
            </motion.span>
          ))}
        </motion.p>

        <motion.div
          animate="visible"
          className="mt-12 flex w-full flex-col items-center justify-center gap-5 sm:w-auto sm:flex-row sm:gap-8"
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
