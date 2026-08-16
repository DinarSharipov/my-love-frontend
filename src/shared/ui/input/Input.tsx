import { AnimatePresence, motion } from 'motion/react';
import { forwardRef, useId, useState } from 'react';
import type { ComponentPropsWithoutRef, FocusEvent } from 'react';

type InputProps = ComponentPropsWithoutRef<'input'> & {
  containerClassName?: string;
  error?: string;
  hint?: string;
  label?: string;
};

const idleFrame = {
  borderColor: 'var(--color-border)',
  boxShadow: '0 0 0 0 transparent',
};

const focusedFrame = {
  borderColor: 'var(--color-primary-neon)',
  boxShadow:
    '0 0 0 3px color-mix(in srgb, var(--color-primary-neon) 16%, transparent), 0 0 26px color-mix(in srgb, var(--color-primary-neon) 14%, transparent)',
};

const errorFrame = {
  borderColor: 'var(--color-neon-pink)',
  boxShadow:
    '0 0 0 3px color-mix(in srgb, var(--color-neon-pink) 14%, transparent), 0 0 24px color-mix(in srgb, var(--color-neon-pink) 12%, transparent)',
};

const focusWaves = [
  { color: 'var(--color-primary-neon)', delay: 0, id: 'primary' },
  { color: 'var(--color-neon-pink)', delay: 0.9, id: 'pink' },
  { color: 'var(--color-cyber-cyan)', delay: 1.8, id: 'cyan' },
];

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      'aria-describedby': ariaDescribedBy,
      className = '',
      containerClassName = '',
      error,
      hint,
      id,
      label,
      onBlur,
      onFocus,
      ...inputProps
    },
    ref,
  ) => {
    const generatedId = useId();
    const [isFocused, setIsFocused] = useState(false);
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;
    let descriptionId = ariaDescribedBy;
    let frameAnimation = idleFrame;

    if (hint) {
      descriptionId = hintId;
    }

    if (isFocused) {
      frameAnimation = focusedFrame;
    }

    if (error) {
      descriptionId = errorId;
      frameAnimation = errorFrame;
    }

    const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(event);
    };

    const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(event);
    };

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <div className="mb-2 flex h-5 items-center justify-between gap-gap">
            <motion.label
              animate={{
                color: isFocused ? 'var(--color-text)' : 'var(--color-muted-text)',
              }}
              className="shrink-0 text-sm font-medium"
              htmlFor={inputId}
              transition={{ duration: 0.2 }}
            >
              {label}
            </motion.label>
            <AnimatePresence initial={false} mode="wait">
              {error && (
                <motion.span
                  animate={{ opacity: 1, x: 0 }}
                  className="text-neon-pink min-w-0 truncate text-right text-xs"
                  exit={{ opacity: 0, x: 6 }}
                  id={errorId}
                  initial={{ opacity: 0, x: 6 }}
                  key={error}
                  role="alert"
                  title={error}
                >
                  {error}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="relative">
          <AnimatePresence initial={false}>
            {isFocused && (
              <motion.div
                animate={{ opacity: 1 }}
                className="pointer-events-none absolute inset-0 z-0"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                transition={{ duration: 0.45 }}
              >
                {focusWaves.map((wave) => (
                  <motion.span
                    animate={{ opacity: [0, 0.34, 0], scale: [1, 1.045, 1.14] }}
                    className="absolute inset-0 rounded-2xl border"
                    initial={{ opacity: 0, scale: 1 }}
                    key={wave.id}
                    style={{ borderColor: wave.color }}
                    transition={{
                      delay: wave.delay,
                      duration: 3.2,
                      ease: 'easeOut',
                      repeat: Infinity,
                      times: [0, 0.28, 1],
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            animate={frameAnimation}
            className="bg-elevated relative z-10 overflow-hidden rounded-2xl border"
            initial={false}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            whileHover={
              isFocused || error ? undefined : { borderColor: 'var(--color-electric-purple)' }
            }
          >
            <motion.span
              animate={{ opacity: isFocused ? 1 : 0.45, scaleX: isFocused ? 1 : 0.72 }}
              className="from-primary-neon via-neon-pink to-cyber-cyan pointer-events-none absolute inset-x-0 top-0 h-px origin-center bg-gradient-to-r"
              transition={{ duration: 0.3 }}
            />
            <input
              {...inputProps}
              ref={ref}
              aria-describedby={descriptionId}
              aria-invalid={Boolean(error)}
              className={`text-text placeholder:text-muted-text/60 w-full bg-transparent px-4 py-3.5 outline-none ${className}`}
              id={inputId}
              onBlur={handleBlur}
              onFocus={handleFocus}
            />
          </motion.div>
        </div>

        <AnimatePresence initial={false} mode="wait">
          {!label && error ? (
            <motion.p
              animate={{ opacity: 1, y: 0 }}
              className="text-neon-pink mt-2 text-sm"
              exit={{ opacity: 0, y: -4 }}
              id={errorId}
              initial={{ opacity: 0, y: -4 }}
              key="error"
              role="alert"
            >
              {error}
            </motion.p>
          ) : (
            !error &&
            hint && (
              <motion.p
                animate={{ opacity: 1, y: 0 }}
                className="text-muted-text mt-2 text-sm"
                exit={{ opacity: 0, y: -4 }}
                id={hintId}
                initial={{ opacity: 0, y: -4 }}
                key="hint"
              >
                {hint}
              </motion.p>
            )
          )}
        </AnimatePresence>
      </div>
    );
  },
);

Input.displayName = 'Input';
