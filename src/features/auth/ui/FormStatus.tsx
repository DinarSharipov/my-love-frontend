import { motion } from 'motion/react';

type FormStatusProps = {
  message?: string;
  variant?: 'error' | 'success';
};

export const FormStatus = ({ message, variant = 'error' }: FormStatusProps) => {
  if (!message) {
    return null;
  }

  return (
    <motion.p
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border px-4 py-3 text-sm ${
        variant === 'success'
          ? 'border-acid-green/50 bg-acid-green/10 text-acid-green'
          : 'border-neon-pink/50 bg-neon-pink/10 text-neon-pink'
      }`}
      initial={{ opacity: 0, y: -6 }}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      {message}
    </motion.p>
  );
};
