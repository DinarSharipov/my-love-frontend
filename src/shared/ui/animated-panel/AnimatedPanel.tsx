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

const smokeClouds = [
  {
    className: '-left-12 -top-10 h-28 w-52',
    color: 'rgba(176, 38, 255, 0.72)',
    duration: 4.8,
    x: [0, 20, -8, 0],
    y: [0, -8, 7, 0],
  },
  {
    className: '-right-14 top-[18%] h-48 w-28',
    color: 'rgba(0, 245, 255, 0.56)',
    duration: 5.4,
    x: [0, 10, -9, 0],
    y: [0, 22, -12, 0],
  },
  {
    className: '-bottom-12 right-[8%] h-28 w-64',
    color: 'rgba(255, 43, 214, 0.62)',
    duration: 5.8,
    x: [0, -24, 14, 0],
    y: [0, 8, -7, 0],
  },
  {
    className: '-left-14 bottom-[8%] h-44 w-28',
    color: 'rgba(124, 58, 237, 0.62)',
    duration: 5.1,
    x: [0, -8, 11, 0],
    y: [0, -18, 10, 0],
  },
] as const;

const createSmokeVariants = (cloud: (typeof smokeClouds)[number]): Variants => ({
  hidden: { opacity: 0, scale: 0.72 },
  visible: { opacity: 0, scale: 0.82 },
  hover: {
    opacity: [0.12, 0.36, 0.18],
    scale: [0.9, 1.12, 0.98],
    transition: {
      duration: cloud.duration,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'mirror',
    },
    x: [...cloud.x],
    y: [...cloud.y],
  },
});

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
    className={`relative isolate w-full max-w-xl p-8 md:p-12 ${className}`}
    initial="hidden"
    variants={panelVariants}
    whileHover="hover"
    {...props}
  >
    {smokeClouds.map((cloud) => (
      <motion.span
        aria-hidden="true"
        className={`pointer-events-none absolute -z-10 rounded-full blur-3xl ${cloud.className}`}
        key={cloud.className}
        style={{ background: `radial-gradient(circle, ${cloud.color} 0%, transparent 70%)` }}
        variants={createSmokeVariants(cloud)}
      />
    ))}

    <motion.div
      aria-hidden="true"
      className="bg-surface/90 absolute inset-0 -z-10 rounded-3xl border backdrop-blur-md"
      variants={surfaceVariants}
    />

    <div className="relative z-10">{children}</div>
  </motion.section>
);
