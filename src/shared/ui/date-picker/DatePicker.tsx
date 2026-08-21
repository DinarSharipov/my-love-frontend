import { CalendarDays } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { forwardRef, useId, useImperativeHandle, useRef, useState } from 'react';
import type { ComponentPropsWithoutRef, FocusEvent } from 'react';

type DatePickerProps = Omit<ComponentPropsWithoutRef<'input'>, 'type'> & {
  containerClassName?: string;
  error?: string;
  hint?: string;
  label?: string;
  withTime?: boolean;
};

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
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
      withTime = false,
      ...inputProps
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;
    let descriptionId = ariaDescribedBy;

    if (error) {
      descriptionId = errorId;
    } else if (hint) {
      descriptionId = hintId;
    }

    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(event);
    };

    const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(event);
    };

    const openPicker = () => {
      inputRef.current?.focus();
      inputRef.current?.showPicker?.();
    };

    let frameClassName = 'border-border hover:border-electric-purple';

    if (error) {
      frameClassName =
        'border-neon-pink shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-neon-pink)_14%,transparent)]';
    } else if (isFocused) {
      frameClassName =
        'border-primary-neon shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-primary-neon)_16%,transparent),0_0_26px_color-mix(in_srgb,var(--color-primary-neon)_14%,transparent)]';
    }

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <div className="mb-2 flex h-5 items-center justify-between gap-gap">
            <motion.label
              animate={{ color: isFocused ? 'var(--color-text)' : 'var(--color-muted-text)' }}
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

        <div
          className={`bg-elevated relative overflow-hidden rounded-2xl border transition-[border-color,box-shadow] duration-200 ${frameClassName}`}
        >
          <span className="from-primary-neon via-neon-pink to-cyber-cyan pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r" />
          <input
            {...inputProps}
            ref={inputRef}
            aria-describedby={descriptionId}
            aria-invalid={Boolean(error)}
            className={`text-text [&::-webkit-calendar-picker-indicator]:hidden h-10 w-full bg-transparent px-4 py-0 pr-12 outline-none ${className}`}
            id={inputId}
            onBlur={handleBlur}
            onFocus={handleFocus}
            type={withTime ? 'datetime-local' : 'date'}
          />
          <button
            aria-label={label ? `Открыть календарь: ${label}` : 'Открыть календарь'}
            className="text-primary-neon hover:text-cyber-cyan focus-visible:text-cyber-cyan absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg outline-none transition-colors"
            onClick={openPicker}
            type="button"
          >
            <CalendarDays aria-hidden="true" className="size-5" />
          </button>
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
                role="note"
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

DatePicker.displayName = 'DatePicker';
