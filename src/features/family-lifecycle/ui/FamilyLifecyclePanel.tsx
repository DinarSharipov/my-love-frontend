import { Archive, HeartCrack, LogOut, RotateCcw, ShieldAlert } from 'lucide-react';
import { useState } from 'react';

import {
  type DissolutionResponseDto,
  getApiErrorMessage,
  useArchiveFamilyMutation,
  useLeaveFamilyMutation,
  useRequestDissolutionMutation,
  useRestoreFamilyMutation,
} from '@/shared/api';
import { AnimatedPanel, Button, ConfirmDialog } from '@/shared/ui';

type FamilyLifecyclePanelProps = {
  status: 'ACTIVE' | 'ARCHIVED' | 'DISSOLVED';
};

type LifecycleAction = 'leave' | 'archive' | 'request-dissolution';

const actionCopy: Record<
  LifecycleAction,
  { confirmLabel: string; description: string; title: string }
> = {
  leave: {
    confirmLabel: 'Выйти',
    description: 'Вы выйдете из семьи, но общие данные сохранятся.',
    title: 'Выйти из семьи?',
  },
  archive: {
    confirmLabel: 'Архивировать',
    description: 'Семья будет архивирована. Доступ и общие данные можно будет восстановить позже.',
    title: 'Архивировать семью?',
  },
  'request-dissolution': {
    confirmLabel: 'Запросить',
    description:
      'Второй партнёр получит уведомление. Семья будет расформирована только после его подтверждения.',
    title: 'Запросить расформирование семьи?',
  },
};

export const FamilyLifecyclePanel = ({ status }: FamilyLifecyclePanelProps) => {
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<LifecycleAction | null>(null);
  const [dissolution, setDissolution] = useState<DissolutionResponseDto | null>(null);
  const [leaveFamily, leaveState] = useLeaveFamilyMutation();
  const [archiveFamily, archiveState] = useArchiveFamilyMutation();
  const [restoreFamily, restoreState] = useRestoreFamilyMutation();
  const [requestDissolution, requestDissolutionState] = useRequestDissolutionMutation();

  const run = async (action: () => Promise<unknown>) => {
    setError(null);
    setNotice(null);
    try {
      await action();
    } catch (cause) {
      setError(getApiErrorMessage(cause, 'Не удалось изменить состояние семьи'));
    }
  };

  const busy =
    leaveState.isLoading ||
    archiveState.isLoading ||
    restoreState.isLoading ||
    requestDissolutionState.isLoading;
  const confirmPending = pendingAction !== null;

  const confirmAction = async () => {
    if (pendingAction === 'leave') await run(() => leaveFamily().unwrap());
    if (pendingAction === 'archive') await run(() => archiveFamily().unwrap());
    if (pendingAction === 'request-dissolution') {
      await run(async () => {
        const request = await requestDissolution().unwrap();
        setDissolution(request);
        setNotice('Запрос отправлен. Второму партнёру направлено уведомление для подтверждения.');
      });
    }
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
            <Button
              className="border-neon-pink/70 text-neon-pink"
              disabled={busy}
              icon={<HeartCrack aria-hidden="true" className="h-4 w-4" />}
              onClick={() => setPendingAction('request-dissolution')}
              size="s"
            >
              Запросить расформирование
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
      {status === 'DISSOLVED' && (
        <p className="text-muted-text mt-4 text-sm">
          Семья расформирована. Общие данные остаются сохранёнными согласно политике доступа.
        </p>
      )}
      {dissolution?.status === 'PENDING' && (
        <p className="text-cyber-cyan mt-3 text-xs" role="status">
          Запрос ожидает подтверждения второго партнёра.
        </p>
      )}
      {notice && (
        <p className="text-cyber-cyan mt-3 text-xs" role="status">
          {notice}
        </p>
      )}
      {error && (
        <p className="text-neon-pink mt-3 text-xs" role="alert">
          {error}
        </p>
      )}
      <ConfirmDialog
        confirmLabel={pendingAction ? actionCopy[pendingAction].confirmLabel : undefined}
        description={pendingAction ? actionCopy[pendingAction].description : ''}
        isLoading={busy}
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmAction}
        open={confirmPending}
        title={pendingAction ? actionCopy[pendingAction].title : ''}
      />
    </AnimatedPanel>
  );
};
