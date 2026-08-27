import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useState, type PropsWithChildren } from 'react';

import mainBackground from '@/shared/assets/main-bg.png';

type AppBackgroundProps = PropsWithChildren<{
  useDefaultImage?: boolean;
}>;

const readBackgroundImage = (useDefaultImage: boolean) => {
  try {
    const value = JSON.parse(localStorage.getItem('my-love-theme') ?? '{}') as {
      backgroundImage?: string;
    };
    if (value.backgroundImage) return `url("${value.backgroundImage}")`;
  } catch {
    // An invalid saved preference must not affect the application's base background.
  }

  return useDefaultImage ? `url("${mainBackground}")` : undefined;
};

const backgroundFadeMask = {
  aspectRatio: '3 / 2',
  maskImage: 'linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%)',
  WebkitMaskImage:
    'linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%)',
  width: 'min(100vw, 150vh)',
};

export const AppBackground = ({ children, useDefaultImage = false }: AppBackgroundProps) => {
  const shouldReduceMotion = useReducedMotion();
  const [backgroundImage, setBackgroundImage] = useState(() =>
    readBackgroundImage(useDefaultImage),
  );

  useEffect(() => {
    const update = () => setBackgroundImage(readBackgroundImage(useDefaultImage));
    window.addEventListener('my-love-theme-change', update);
    return () => window.removeEventListener('my-love-theme-change', update);
  }, [useDefaultImage]);

  const backgroundStyle = { backgroundImage };

  return (
    <div className="bg-background relative isolate min-h-screen overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-70"
          style={{ backgroundImage }}
        />
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden"
          style={backgroundFadeMask}
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat will-change-transform"
            style={backgroundStyle}
          />

          {!shouldReduceMotion && (
            <motion.div
              animate={{ opacity: [0, 0, 0.42, 0.08, 0.5, 0], x: [0, 0, 13, -9, 5, 0] }}
              className="absolute inset-0 bg-cover bg-center bg-no-repeat mix-blend-screen blur-[1px] will-change-transform"
              style={{
                ...backgroundStyle,
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
          )}

          {!shouldReduceMotion && (
            <motion.div
              animate={{ opacity: [0, 0, 0.38, 0, 0.3, 0], x: [0, 0, -11, 8, -4, 0] }}
              className="absolute inset-0 bg-cover bg-center bg-no-repeat mix-blend-screen blur-[1px] will-change-transform"
              style={{
                ...backgroundStyle,
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
          )}
        </div>

        <div className="from-background/25 via-background/45 to-background/75 absolute inset-0 bg-gradient-to-b" />
        <div className="bg-background/10 absolute inset-0" />
      </div>

      <div className="relative z-10 min-h-screen">{children}</div>
    </div>
  );
};
