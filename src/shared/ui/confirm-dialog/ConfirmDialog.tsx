import { Button } from '@/shared/ui/button';
import { Modal } from '@/shared/ui/modal';

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
}: ConfirmDialogProps) => (
  <Modal
    ariaDescribedBy="confirm-dialog-description"
    ariaLabelledBy="confirm-dialog-title"
    contentClassName="max-w-md p-5"
    onClose={isLoading ? () => undefined : onCancel}
    open={open}
  >
    <h2 className="text-lg font-semibold" id="confirm-dialog-title">
      {title}
    </h2>
    <p className="text-muted-text mt-2 text-sm" id="confirm-dialog-description">
      {description}
    </p>
    <div className="mt-5 flex justify-end gap-gap">
      <Button disabled={isLoading} onClick={onCancel} size="s">
        {cancelLabel}
      </Button>
      <Button disabled={isLoading} onClick={onConfirm} size="s">
        {isLoading ? 'Выполняется…' : confirmLabel}
      </Button>
    </div>
  </Modal>
);
