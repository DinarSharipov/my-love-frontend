import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { Variants } from 'motion/react';
import { useLocation, useOutlet } from 'react-router-dom';

const curtainVariants: Variants = {
  closed: { scaleX: 1 },
  opened: {
    scaleX: 0,
    transition: {
      delay: 0.08,
      duration: 0.72,
      ease: [0.76, 0, 0.24, 1],
    },
  },
};

const pageVariants: Variants = {
  enter: { opacity: 0.72 },
  center: {
    opacity: 1,
    transition: { delay: 0.24, duration: 0.38 },
  },
  exit: {
    opacity: 0.72,
    transition: { duration: 0.46 },
  },
};

export const RouteTransition = () => {
  const location = useLocation();
  const outlet = useOutlet();
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return outlet;
  }

  return (
    <AnimatePresence initial={false} mode="wait">
      <motion.div
        animate="center"
        className="min-h-dvh"
        exit="exit"
        initial="enter"
        key={location.pathname}
        variants={pageVariants}
      >
        {outlet}

        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[100] flex overflow-hidden"
        >
          <motion.div
            animate="opened"
            className="border-primary-neon/80 from-background via-elevated to-electric-purple/35 relative h-full w-1/2 origin-left border-r bg-gradient-to-r shadow-[12px_0_40px_rgba(176,38,255,0.32)]"
            exit="closed"
            initial="closed"
            variants={curtainVariants}
          >
            <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_35%,rgba(176,38,255,0.08)_50%,transparent_65%)]" />
          </motion.div>

          <motion.div
            animate="opened"
            className="border-primary-neon/80 from-electric-purple/35 via-elevated to-background relative h-full w-1/2 origin-right border-l bg-gradient-to-r shadow-[-12px_0_40px_rgba(176,38,255,0.32)]"
            exit="closed"
            initial="closed"
            variants={curtainVariants}
          >
            <div className="absolute inset-0 bg-[linear-gradient(65deg,transparent_35%,rgba(0,245,255,0.07)_50%,transparent_65%)]" />
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
