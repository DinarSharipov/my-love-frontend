import { motion } from 'motion/react';
import type { ReactNode } from 'react';

import { AnimatedPanel } from '@/shared/ui';

type AuthFormLayoutProps = {
  children: ReactNode;
  isWide?: boolean;
  subtitle: string;
  title: string;
};

export const AuthFormLayout = ({
  children,
  isWide = false,
  subtitle,
  title,
}: AuthFormLayoutProps) => (
  <main className="text-text flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
    <AnimatedPanel className={isWide ? 'max-w-3xl' : 'max-w-lg'}>
      <motion.header
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
        initial={{ opacity: 0, y: -12 }}
        transition={{ delay: 0.15, duration: 0.45 }}
      >
        <h1 className="from-primary-neon via-neon-pink to-cyber-cyan bg-gradient-to-r bg-clip-text text-3xl font-black tracking-tight text-transparent sm:text-4xl">
          {title}
        </h1>
        <p className="text-muted-text mt-3 leading-relaxed">{subtitle}</p>
      </motion.header>
      {children}
    </AnimatedPanel>
  </main>
);
