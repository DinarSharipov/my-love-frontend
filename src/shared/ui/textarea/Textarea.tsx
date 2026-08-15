import { AnimatePresence, motion } from 'motion/react';
import { forwardRef, useId, useState } from 'react';
import type { ComponentPropsWithoutRef, FocusEvent } from 'react';

type TextareaProps = ComponentPropsWithoutRef<'textarea'> & {
  containerClassName?: string;
  error?: string;
  hint?: string;
  label?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
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
      ...textareaProps
    },
    ref,
  ) => {
    const generatedId = useId();
    const [isFocused, setIsFocused] = useState(false);
    const textareaId = id ?? generatedId;
    const errorId = `${textareaId}-error`;
    const hintId = `${textareaId}-hint`;
    let descriptionId = ariaDescribedBy;
    let borderColor = 'var(--color-border)';

    if (hint) descriptionId = hintId;
    if (isFocused) borderColor = 'var(--color-primary-neon)';
    if (error) {
      descriptionId = errorId;
      borderColor = 'var(--color-neon-pink)';
    }

    const handleFocus = (event: FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true);
      onFocus?.(event);
    };

    const handleBlur = (event: FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false);
      onBlur?.(event);
    };

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <div className="mb-2 flex min-h-5 items-center justify-between gap-3">
            <motion.label
              animate={{ color: isFocused ? 'var(--color-text)' : 'var(--color-muted-text)' }}
              className="shrink-0 text-sm font-medium"
              htmlFor={textareaId}
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

        <motion.div
          animate={{
            borderColor,
            boxShadow: isFocused
              ? '0 0 0 3px color-mix(in srgb, var(--color-primary-neon) 16%, transparent), 0 0 26px color-mix(in srgb, var(--color-primary-neon) 14%, transparent)'
              : '0 0 0 0 transparent',
          }}
          className="bg-elevated relative overflow-hidden rounded-2xl border"
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          <motion.span
            animate={{ opacity: isFocused ? 1 : 0.45, scaleX: isFocused ? 1 : 0.72 }}
            className="from-primary-neon via-neon-pink to-cyber-cyan pointer-events-none absolute inset-x-0 top-0 h-px origin-center bg-gradient-to-r"
          />
          <textarea
            {...textareaProps}
            ref={ref}
            aria-describedby={descriptionId}
            aria-invalid={Boolean(error)}
            className={`text-text placeholder:text-muted-text/60 min-h-28 w-full resize-y bg-transparent px-4 py-3.5 outline-none ${className}`}
            id={textareaId}
            onBlur={handleBlur}
            onFocus={handleFocus}
          />
        </motion.div>

        {!error && hint && (
          <p className="text-muted-text mt-2 text-sm" id={hintId}>
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
