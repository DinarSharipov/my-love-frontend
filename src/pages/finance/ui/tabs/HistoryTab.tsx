import { RotateCcw } from 'lucide-react';

import type { LedgerTransaction } from '@/entities/finance';
import { useListLedgerQuery, useReverseLedgerMutation } from '@/entities/finance';
import { AnimatedPanel, AsyncState, Button } from '@/shared/ui';

const labels: Record<LedgerTransaction['type'], string> = {
  INCOME: 'Доход',
  EXPENSE: 'Расход',
  TRANSFER: 'Перевод',
  REVERSAL: 'Отмена',
};
const makeKey = () => `${Date.now()}-${crypto.randomUUID()}`;

export const HistoryTab = () => {
  const query = useListLedgerQuery({ page: 1, limit: 50 });
  const [reverse] = useReverseLedgerMutation();
  const onReverse = (transaction: LedgerTransaction) =>
    reverse({ id: transaction.id, key: makeKey() }).unwrap();
  return (
    <AsyncState
      error={query.error}
      errorMessage="Не удалось загрузить историю"
      hasData={Boolean(query.data)}
      isLoading={query.isLoading}
      onRetry={query.refetch}
    >
      <AnimatedPanel className="min-w-0 p-5">
        <h2 className="text-text mb-4 text-lg font-semibold">История операций</h2>
        {query.data?.data.length ? (
          <div className="flex flex-col gap-gap">
            {query.data.data.map((transaction) => (
              <div
                className="border-border bg-surface flex min-w-0 items-center justify-between rounded-panel border p-3"
                key={transaction.id}
              >
                <div className="min-w-0">
                  <p className="text-text font-medium">{labels[transaction.type]}</p>
                  <p className="text-muted-text truncate text-sm">
                    {transaction.note || 'Без комментария'} ·{' '}
                    {new Date(transaction.occurredAt).toLocaleDateString('ru-RU')}
                  </p>
                </div>
                <div className="flex items-center gap-gap">
                  <span className="text-text shrink-0 font-semibold">
                    {transaction.entries.find((entry) => entry.walletId)?.amountMinor ?? '—'}{' '}
                    {transaction.currency}
                  </span>
                  {transaction.type !== 'REVERSAL' && (
                    <Button
                      icon={<RotateCcw className="size-4" />}
                      onClick={() => onReverse(transaction)}
                      size="s"
                      title="Отменить операцию"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-text">Операций пока нет.</p>
        )}
      </AnimatedPanel>
    </AsyncState>
  );
};
