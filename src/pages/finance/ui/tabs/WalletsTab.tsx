import { Archive, Plus, RotateCcw, WalletCards } from 'lucide-react';
import { useState } from 'react';
import {
  useArchiveFinanceWalletMutation,
  useCreateFinanceWalletMutation,
  useGetExpenseStatisticsQuery,
  useGetFinancialSummaryQuery,
  useListFinanceWalletsQuery,
  useListArchivedFinanceWalletsQuery,
  useRestoreFinanceWalletMutation,
} from '@/entities/finance';
import { getApiErrorMessage } from '@/shared/api';
import { AnimatedPanel, AsyncState, Button, Input } from '@/shared/ui';

export const WalletsTab = () => {
  const [showArchived, setShowArchived] = useState(false);
  const activeWalletsQuery = useListFinanceWalletsQuery(undefined, { skip: showArchived });
  const archivedWalletsQuery = useListArchivedFinanceWalletsQuery(undefined, {
    skip: !showArchived,
  });
  const walletsQuery = showArchived ? archivedWalletsQuery : activeWalletsQuery;
  const summaryQuery = useGetFinancialSummaryQuery();
  const statisticsQuery = useGetExpenseStatisticsQuery();
  const [createWallet, state] = useCreateFinanceWalletMutation();
  const [archiveWallet] = useArchiveFinanceWalletMutation();
  const [restoreWallet] = useRestoreFinanceWalletMutation();
  const [name, setName] = useState('');
  const [error, setError] = useState<string>();
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    try {
      await createWallet({ name: name.trim(), type: 'PERSONAL', currency: 'RUB' }).unwrap();
      setName('');
    } catch (e) {
      setError(getApiErrorMessage(e, 'Не удалось создать кошелёк'));
    }
  };
  return (
    <AsyncState
      error={walletsQuery.error}
      errorMessage="Не удалось загрузить кошельки"
      hasData={Boolean(walletsQuery.data)}
      isLoading={walletsQuery.isLoading}
      onRetry={walletsQuery.refetch}
    >
      <div className="grid gap-gap">
        <AnimatedPanel className="p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-gap">
            <WalletCards className="text-cyber-cyan" />
            <h2 className="text-text text-lg font-semibold">Кошельки</h2>
            <Button onClick={() => setShowArchived((value) => !value)} size="s">
              {showArchived ? <RotateCcw className="size-4" /> : <Archive className="size-4" />}
              {showArchived ? 'К активным' : 'Архив кошельков'}
            </Button>
          </div>
          {(walletsQuery.data ?? []).map((wallet) => (
            <div
              className="border-border bg-surface text-text mb-2 flex w-full justify-between rounded-panel border p-3"
              key={wallet.id}
            >
              <span>{wallet.name}</span>
              <span className="text-muted-text text-sm">{wallet.currency}</span>
              <Button
                icon={
                  showArchived ? <RotateCcw className="size-4" /> : <Archive className="size-4" />
                }
                onClick={() =>
                  showArchived
                    ? restoreWallet({ id: wallet.id, version: wallet.version })
                    : archiveWallet({ id: wallet.id, version: wallet.version })
                }
                size="s"
              />
            </div>
          ))}
          <form className="mt-3 flex items-end gap-gap" onSubmit={submit}>
            <Input
              label=""
              onChange={(event) => setName(event.target.value)}
              placeholder="Название кошелька"
              value={name}
            />
            <Button disabled={state.isLoading} icon={<Plus className="size-4" />} type="submit">
              Добавить
            </Button>
          </form>
          {error && <p className="text-neon-pink mt-2 text-sm">{error}</p>}
        </AnimatedPanel>
        <AnimatedPanel className="p-5">
          <h2 className="text-text mb-3 text-lg font-semibold">Вклад участников</h2>
          {statisticsQuery.data?.members.length ? (
            statisticsQuery.data.members.map((member) => (
              <div className="mb-2 flex justify-between" key={member.userId}>
                <span className="text-muted-text">
                  {member.firstName} {member.lastName}
                </span>
                <span className="text-text font-semibold">
                  {member.totals
                    .map((total) => `${total.amountMinor} ${total.currency}`)
                    .join(', ')}
                </span>
              </div>
            ))
          ) : (
            <p className="text-muted-text text-sm">Данные появятся после первых доходов.</p>
          )}
          {summaryQuery.data && (
            <p className="text-muted-text mt-3 text-xs">
              Валюта семьи: {summaryQuery.data.defaultCurrency}
            </p>
          )}
        </AnimatedPanel>
      </div>
    </AsyncState>
  );
};
