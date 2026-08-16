import { Archive, LogOut, RotateCcw, ShieldAlert } from 'lucide-react';
import { useState } from 'react';

import {
  getApiErrorMessage,
  useArchiveFamilyMutation,
  useLeaveFamilyMutation,
  useRestoreFamilyMutation,
} from '@/shared/api';
import { AnimatedPanel, Button } from '@/shared/ui';

type FamilyLifecyclePanelProps = {
  status: 'ACTIVE' | 'ARCHIVED' | 'DISSOLVED';
};

export const FamilyLifecyclePanel = ({ status }: FamilyLifecyclePanelProps) => {
  const [error, setError] = useState<string | null>(null);
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

  return (
    <AnimatedPanel className="mt-5 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <ShieldAlert aria-hidden="true" className="text-cyber-cyan mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <h2 className="text-text text-lg font-semibold">Доступ и состояние семьи</h2>
          <p className="text-muted-text mt-1 text-sm">
            Общие данные сохраняются при выходе или архивации. Удаление чужих семейных данных
            одним участником не выполняется.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {status === 'ACTIVE' && (
          <>
            <Button
              disabled={busy}
              onClick={() => {
                // eslint-disable-next-line no-alert
                if (window.confirm('Выйти из семьи? Общие данные будут сохранены.')) {
                  run(() => leaveFamily().unwrap());
                }
              }}
              size="s"
            >
              <LogOut aria-hidden="true" className="h-4 w-4" />
              Выйти из семьи
            </Button>
            <Button
              disabled={busy}
              onClick={() => {
                // eslint-disable-next-line no-alert
                if (window.confirm('Архивировать семью? Доступ можно будет восстановить.')) {
                  run(() => archiveFamily().unwrap());
                }
              }}
              size="s"
            >
              <Archive aria-hidden="true" className="h-4 w-4" />
              Архивировать
            </Button>
          </>
        )}
        {status === 'ARCHIVED' && (
          <Button disabled={busy} onClick={() => run(() => restoreFamily().unwrap())} size="s">
            <RotateCcw aria-hidden="true" className="h-4 w-4" />
            Восстановить семью
          </Button>
        )}
      </div>
      {error && <p className="text-neon-pink mt-3 text-xs" role="alert">{error}</p>}
    </AnimatedPanel>
  );
};
