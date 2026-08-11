import { motion } from 'motion/react';
import type { PropsWithChildren } from 'react';

import mainBackground from '@/shared/assets/main-bg.png';
import { BackgroundMusic } from '@/shared/ui/background-music';

const backgroundImage = {
  backgroundImage: `url(${mainBackground})`,
};

export const AppBackground = ({ children }: PropsWithChildren) => (
  <div className="bg-background relative isolate min-h-screen overflow-hidden">
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <motion.div
        animate={{ x: [0, 0, -5, 4, -2, 0], y: [0, 0, 1, -1, 0, 0] }}
        className="absolute inset-0 bg-contain bg-center bg-no-repeat will-change-transform"
        style={backgroundImage}
        transition={{
          delay: 6,
          duration: 0.48,
          ease: 'linear',
          repeat: Infinity,
          repeatDelay: 9.5,
          times: [0, 0.45, 0.56, 0.7, 0.84, 1],
        }}
      />

      <motion.div
        animate={{ opacity: [0, 0, 0.42, 0.08, 0.5, 0], x: [0, 0, 13, -9, 5, 0] }}
        className="absolute inset-0 bg-contain bg-center bg-no-repeat mix-blend-screen blur-[1px] will-change-transform"
        style={{
          ...backgroundImage,
          clipPath: 'inset(18% 0 58% 0)',
          filter: 'hue-rotate(155deg) saturate(1.5)',
        }}
        transition={{
          delay: 6,
          duration: 0.52,
          ease: 'linear',
          repeat: Infinity,
          repeatDelay: 9.5,
          times: [0, 0.46, 0.55, 0.7, 0.84, 1],
        }}
      />

      <motion.div
        animate={{ opacity: [0, 0, 0.38, 0, 0.3, 0], x: [0, 0, -11, 8, -4, 0] }}
        className="absolute inset-0 bg-contain bg-center bg-no-repeat mix-blend-screen blur-[1px] will-change-transform"
        style={{
          ...backgroundImage,
          clipPath: 'inset(62% 0 17% 0)',
          filter: 'hue-rotate(300deg) saturate(1.65)',
        }}
        transition={{
          delay: 6.12,
          duration: 0.46,
          ease: 'linear',
          repeat: Infinity,
          repeatDelay: 9.62,
          times: [0, 0.42, 0.56, 0.7, 0.84, 1],
        }}
      />

      <div className="from-background/25 via-background/45 to-background/80 absolute inset-0 bg-gradient-to-b" />
      <div className="bg-background/15 absolute inset-0" />
    </div>

    <div className="relative z-10 min-h-screen">{children}</div>
    <BackgroundMusic />
  </div>
);
