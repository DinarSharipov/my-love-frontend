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
  onClose: () => void;
  open: boolean;
};

export const Modal = ({
  ariaDescribedBy,
  ariaLabel,
  ariaLabelledBy,
  children,
  className = '',
  contentClassName = '',
  onClose,
  open,
}: ModalProps) => {
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
            animate={{ opacity: 1, scale: 1, y: 0 }}
            aria-describedby={ariaDescribedBy}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-modal="true"
            className={`border-border bg-surface/95 text-text max-h-[90vh] w-full cursor-default overflow-auto rounded-2xl border p-4 shadow-[0_0_55px_color-mix(in_srgb,var(--color-primary-neon)_28%,transparent)] outline-none ${contentClassName}`}
            exit={{ opacity: 0, scale: 0.96, y: 18 }}
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            role="dialog"
            tabIndex={-1}
            transition={{ duration: 0.24, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
