import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import { Button } from '@/shared/ui/button';

type ConfirmDialogProps = {
  cancelLabel?: string;
  confirmLabel?: string;
  description: string;
  isLoading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
  title: string;
};

export const ConfirmDialog = ({
  cancelLabel = 'Отмена',
  confirmLabel = 'Подтвердить',
  description,
  isLoading = false,
  onCancel,
  onConfirm,
  open,
  title,
}: ConfirmDialogProps) => {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    cancelRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isLoading) onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isLoading, onCancel, open]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] grid place-items-center bg-black/65 p-4 backdrop-blur-sm"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isLoading) onCancel();
          }}
        >
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            aria-describedby="confirm-dialog-description"
            aria-labelledby="confirm-dialog-title"
            aria-modal="true"
            className="border-border bg-surface/95 text-text w-full max-w-md rounded-2xl border p-5 shadow-[0_0_40px_color-mix(in_srgb,var(--color-primary-neon)_24%,transparent)]"
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
          >
            <h2 className="text-lg font-semibold" id="confirm-dialog-title">
              {title}
            </h2>
            <p className="text-muted-text mt-2 text-sm" id="confirm-dialog-description">
              {description}
            </p>
            <div className="mt-5 flex justify-end gap-gap">
              <Button disabled={isLoading} onClick={onCancel} ref={cancelRef} size="s">
                {cancelLabel}
              </Button>
              <Button disabled={isLoading} onClick={onConfirm} size="s">
                {isLoading ? 'Выполняется…' : confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
