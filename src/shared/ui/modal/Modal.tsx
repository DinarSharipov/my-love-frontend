import { AnimatePresence, motion } from 'motion/react';
import { createPortal } from 'react-dom';
import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

type ModalProps = {
  ariaDescribedBy?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  layoutId?: string;
  onClose: () => void;
  open: boolean;
  variant?: 'default' | 'shared-layout';
};

export const Modal = ({
  ariaDescribedBy,
  ariaLabel,
  ariaLabelledBy,
  children,
  className = '',
  contentClassName = '',
  layoutId,
  onClose,
  open,
  variant = 'default',
}: ModalProps) => {
  const isSharedLayout = variant === 'shared-layout';
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return undefined;

    contentRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          animate={{ opacity: 1 }}
          className={`fixed inset-0 z-[100] grid cursor-pointer place-items-center bg-black/75 p-4 backdrop-blur-sm ${className}`}
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            ref={contentRef}
            animate={layoutId ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            aria-describedby={ariaDescribedBy}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-modal="true"
            className={`${
              isSharedLayout
                ? 'text-text max-h-[90vh] w-auto max-w-[90vw] overflow-visible rounded-2xl bg-transparent p-0 shadow-none outline-none'
                : 'border-border bg-surface/95 text-text max-h-[90vh] w-full overflow-auto rounded-2xl border p-4 shadow-[0_0_55px_color-mix(in_srgb,var(--color-primary-neon)_28%,transparent)] outline-none'
            } ${contentClassName}`}
            exit={layoutId ? { opacity: 1 } : { opacity: 0, scale: 0.96, y: 18 }}
            initial={layoutId ? { opacity: 1 } : { opacity: 0, scale: 0.96, y: 18 }}
            layoutId={layoutId}
            role="dialog"
            tabIndex={-1}
            transition={
              layoutId
                ? { type: 'spring', bounce: 0.18, duration: 0.45 }
                : { duration: 0.24, ease: 'easeOut' }
            }
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
