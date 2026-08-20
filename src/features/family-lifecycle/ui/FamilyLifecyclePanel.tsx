import { Archive, LogOut, RotateCcw, ShieldAlert } from 'lucide-react';
import { useState } from 'react';

import {
  getApiErrorMessage,
  useArchiveFamilyMutation,
  useLeaveFamilyMutation,
  useRestoreFamilyMutation,
} from '@/shared/api';
import { AnimatedPanel, Button, ConfirmDialog } from '@/shared/ui';

type FamilyLifecyclePanelProps = {
  status: 'ACTIVE' | 'ARCHIVED' | 'DISSOLVED';
};

export const FamilyLifecyclePanel = ({ status }: FamilyLifecyclePanelProps) => {
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<'leave' | 'archive' | null>(null);
  const [leaveFamily, leaveState] = useLeaveFamilyMutation();
  const [archiveFamily, archiveState] = useArchiveFamilyMutation();
  const [restoreFamily, restoreState] = useRestoreFamilyMutation();

  const run = async (action: () => Promise<unknown>) => {
    setError(null);
    try {
      await action();
    } catch (cause) {
      setError(getApiErrorMessage(cause, 'Не удалось изменить состояние семьи'));
    }
  };

  const busy = leaveState.isLoading || archiveState.isLoading || restoreState.isLoading;
  const confirmPending = pendingAction !== null;

  const confirmAction = async () => {
    if (pendingAction === 'leave') await run(() => leaveFamily().unwrap());
    if (pendingAction === 'archive') await run(() => archiveFamily().unwrap());
    setPendingAction(null);
  };

  return (
    <AnimatedPanel className="mt-5 p-5 sm:p-6">
      <div className="flex items-start gap-gap">
        <ShieldAlert aria-hidden="true" className="text-cyber-cyan mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <h2 className="text-text text-lg font-semibold">Доступ и состояние семьи</h2>
          <p className="text-muted-text mt-1 text-sm">
            Общие данные сохраняются при выходе или архивации. Удаление чужих семейных данных одним
            участником не выполняется.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-gap">
        {status === 'ACTIVE' && (
          <>
            <Button
              disabled={busy}
              icon={<LogOut aria-hidden="true" className="h-4 w-4" />}
              onClick={() => {
                setPendingAction('leave');
              }}
              size="s"
            >
              Выйти из семьи
            </Button>
            <Button
              disabled={busy}
              icon={<Archive aria-hidden="true" className="h-4 w-4" />}
              onClick={() => {
                setPendingAction('archive');
              }}
              size="s"
            >
              Архивировать
            </Button>
          </>
        )}
        {status === 'ARCHIVED' && (
          <Button
            disabled={busy}
            icon={<RotateCcw aria-hidden="true" className="h-4 w-4" />}
            onClick={() => run(() => restoreFamily().unwrap())}
            size="s"
          >
            Восстановить семью
          </Button>
        )}
      </div>
      {error && (
        <p className="text-neon-pink mt-3 text-xs" role="alert">
          {error}
        </p>
      )}
      <ConfirmDialog
        confirmLabel={pendingAction === 'archive' ? 'Архивировать' : 'Выйти из семьи'}
        description={
          pendingAction === 'archive'
            ? 'Семья будет архивирована. Доступ и общие данные можно будет восстановить позже.'
            : 'Вы выйдете из семьи, но общие данные сохранятся.'
        }
        isLoading={busy}
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmAction}
        open={confirmPending}
        title={pendingAction === 'archive' ? 'Архивировать семью?' : 'Выйти из семьи?'}
      />
    </AnimatedPanel>
  );
};
