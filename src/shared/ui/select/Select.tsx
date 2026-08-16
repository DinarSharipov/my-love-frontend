import { AnimatePresence, motion } from 'motion/react';
import { createPortal } from 'react-dom';
import { forwardRef, useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';

export type SelectOption = {
  label: string;
  value: string;
};

type SelectProps = {
  className?: string;
  containerClassName?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  name?: string;
  onBlur?: () => void;
  onChange: (value: string) => void;
  options: readonly SelectOption[];
  placeholder?: string;
  value?: string;
};

export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      className = '',
      containerClassName = '',
      disabled = false,
      error,
      label,
      name,
      onBlur,
      onChange,
      options,
      placeholder = 'Выберите значение',
      value,
    },
    ref,
  ) => {
    const generatedId = useId();
    const containerRef = useRef<HTMLDivElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ left: 0, top: 0, width: 0 });
    const selectId = `${generatedId}-select`;
    const labelId = `${generatedId}-label`;
    const errorId = `${generatedId}-error`;
    const listboxId = `${generatedId}-listbox`;
    const selectedOption = options.find((option) => option.value === value);
    const isActive = isFocused || isOpen;
    let borderColor = 'var(--color-border)';

    if (isActive) {
      borderColor = 'var(--color-primary-neon)';
    }

    if (error) {
      borderColor = 'var(--color-neon-pink)';
    }

    useEffect(() => {
      if (!isOpen) {
        return () => undefined;
      }

      const handlePointerDown = (event: PointerEvent) => {
        if (
          !containerRef.current?.contains(event.target as Node) &&
          !menuRef.current?.contains(event.target as Node)
        ) {
          setIsOpen(false);
          onBlur?.();
        }
      };

      document.addEventListener('pointerdown', handlePointerDown);

      return () => document.removeEventListener('pointerdown', handlePointerDown);
    }, [isOpen, onBlur]);

    useEffect(() => {
      if (!isOpen) return undefined;

      const updatePosition = () => {
        const bounds = containerRef.current?.getBoundingClientRect();
        if (!bounds) return;
        setMenuPosition({ left: bounds.left, top: bounds.bottom + 8, width: bounds.width });
      };

      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      };
    }, [isOpen]);

    const closeMenu = () => {
      setIsOpen(false);
      onBlur?.();
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === 'Escape' && isOpen) {
        event.preventDefault();
        closeMenu();
      }

      if ((event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') && !isOpen) {
        event.preventDefault();
        setIsOpen(true);
      }
    };

    const handleSelect = (optionValue: string) => {
      onChange(optionValue);
      closeMenu();
    };

    return (
      <div ref={containerRef} className={`relative w-full ${containerClassName}`}>
        {label && (
          <div className="mb-2 flex h-5 items-center justify-between gap-gap">
            <motion.label
              animate={{ color: isActive ? 'var(--color-text)' : 'var(--color-muted-text)' }}
              className="shrink-0 text-sm font-medium"
              htmlFor={selectId}
              id={labelId}
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

        <motion.button
          ref={ref}
          animate={{
            borderColor,
            boxShadow: isActive
              ? '0 0 0 3px color-mix(in srgb, var(--color-primary-neon) 16%, transparent), 0 0 26px color-mix(in srgb, var(--color-primary-neon) 14%, transparent)'
              : '0 0 0 0 transparent',
          }}
          aria-controls={isOpen ? listboxId : undefined}
          aria-describedby={error ? errorId : undefined}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-invalid={Boolean(error)}
          aria-labelledby={label ? labelId : undefined}
          className={`bg-elevated text-text relative flex w-full cursor-pointer items-center justify-between overflow-hidden rounded-2xl border px-4 py-3.5 text-left outline-none disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
          disabled={disabled}
          id={selectId}
          name={name}
          onBlur={() => setIsFocused(false)}
          onClick={() => setIsOpen((currentValue) => !currentValue)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          type="button"
        >
          <motion.span
            animate={{ opacity: isActive ? 1 : 0.45, scaleX: isActive ? 1 : 0.72 }}
            className="from-primary-neon via-neon-pink to-cyber-cyan pointer-events-none absolute inset-x-0 top-0 h-px origin-center bg-gradient-to-r"
            transition={{ duration: 0.3 }}
          />
          <span className={selectedOption ? 'text-text' : 'text-muted-text'}>
            {selectedOption?.label ?? placeholder}
          </span>
          <motion.svg
            animate={{ rotate: isOpen ? 180 : 0 }}
            aria-hidden="true"
            className="text-primary-neon ml-3 h-4 w-4 shrink-0"
            fill="none"
            viewBox="0 0 16 16"
          >
            <path d="m3 6 5 5 5-5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
          </motion.svg>
        </motion.button>

        {isOpen &&
          createPortal(
            <motion.div
              ref={menuRef}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              aria-labelledby={label ? labelId : undefined}
              className="border-primary-neon/60 bg-elevated/95 fixed z-[1000] max-h-60 overflow-y-auto rounded-2xl border p-1.5 shadow-[0_0_32px_color-mix(in_srgb,var(--color-primary-neon)_28%,transparent)] backdrop-blur-xl"
              exit={{ opacity: 0, scale: 0.98, y: -8 }}
              id={listboxId}
              initial={{ opacity: 0, scale: 0.98, y: -8 }}
              role="listbox"
              style={menuPosition}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {options.map((option) => {
                const isSelected = option.value === value;

                return (
                  <motion.button
                    aria-selected={isSelected}
                    className={`relative flex w-full cursor-pointer items-center justify-between rounded-xl px-3.5 py-3 text-left text-sm outline-none ${
                      isSelected
                        ? 'bg-primary-neon/15 text-text'
                        : 'text-muted-text hover:bg-electric-purple/15 hover:text-text'
                    }`}
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    role="option"
                    transition={{ duration: 0.15 }}
                    type="button"
                    whileHover={{ x: 3 }}
                  >
                    <span>{option.label}</span>
                    {isSelected && (
                      <motion.span
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-primary-neon shadow-primary-neon h-2 w-2 rounded-full shadow-[0_0_10px_currentColor]"
                        initial={{ opacity: 0, scale: 0 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </motion.div>,
            document.body,
          )}
      </div>
    );
  },
);

Select.displayName = 'Select';
