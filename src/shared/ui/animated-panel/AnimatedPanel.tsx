import { motion, type HTMLMotionProps, type Variants } from 'motion/react';
import type { ReactNode } from 'react';

type AnimatedPanelProps = Omit<HTMLMotionProps<'section'>, 'children'> & {
  children: ReactNode;
};

const panelVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
    y: 0,
  },
  hover: { opacity: 1, y: 0 },
};

const surfaceVariants: Variants = {
  hidden: {
    borderColor: 'var(--color-border)',
    boxShadow: '0 24px 50px rgba(0, 0, 0, 0.45)',
  },
  visible: {
    borderColor: 'var(--color-border)',
    boxShadow: '0 24px 50px rgba(0, 0, 0, 0.45)',
  },
  hover: {
    borderColor: 'var(--color-primary-neon)',
    boxShadow:
      '0 0 10px rgba(176, 38, 255, 0.75), 0 0 28px rgba(176, 38, 255, 0.38), inset 0 0 18px rgba(176, 38, 255, 0.12)',
    transition: { duration: 0.7, ease: 'easeOut' },
  },
};

export const AnimatedPanel = ({ children, className = '', ...props }: AnimatedPanelProps) => (
  <motion.section
    animate="visible"
    className={`relative isolate w-full p-4 ${className}`}
    initial="hidden"
    variants={panelVariants}
    whileHover="hover"
    {...props}
  >
    <motion.div
      aria-hidden="true"
      className="bg-surface/90 absolute inset-0 -z-10 rounded-3xl border backdrop-blur-md"
      variants={surfaceVariants}
    />
    <div className="relative z-10">{children}</div>
  </motion.section>
);
