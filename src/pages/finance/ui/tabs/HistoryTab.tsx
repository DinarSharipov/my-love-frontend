import { RotateCcw } from 'lucide-react';

import type { LedgerTransaction } from '@/entities/finance';
import { useListLedgerQuery, useReverseLedgerMutation } from '@/entities/finance';
import { AnimatedPanel, AsyncState, Button, DownloadLoader } from '@/shared/ui';

const labels: Record<LedgerTransaction['type'], string> = {
  INCOME: 'Доход',
  EXPENSE: 'Расход',
  TRANSFER: 'Перевод',
  REVERSAL: 'Отмена',
};
const makeKey = () => `${Date.now()}-${crypto.randomUUID()}`;

const escapeCsv = (value: string) => `"${value.replaceAll('"', '""')}"`;

const downloadCsv = (transactions: LedgerTransaction[]) => {
  const rows = [
    ['Тип', 'Дата', 'Комментарий', 'Валюта', 'Сумма (minor)', 'Кошельки'],
    ...transactions.map((transaction) => [
      labels[transaction.type],
      transaction.occurredAt,
      transaction.note ?? '',
      transaction.currency,
      transaction.entries.find((entry) => entry.walletId)?.amountMinor ?? '',
      transaction.entries
        .filter((entry) => entry.walletId)
        .map((entry) => entry.walletId)
        .join(', '),
    ]),
  ];
  const csv = `\uFEFF${rows.map((row) => row.map(escapeCsv).join(';')).join('\n')}`;
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `my-love-finance-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

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
        <div className="mb-4 flex flex-wrap items-center justify-between gap-gap">
          <div>
            <h2 className="text-text text-lg font-semibold">История операций</h2>
            <p className="text-muted-text mt-1 text-xs">
              Экспортируется текущая загруженная страница.
            </p>
          </div>
          <DownloadLoader
            aria-label="Скачать историю операций в CSV"
            disabled={!query.data?.data.length}
            onClick={() => query.data && downloadCsv(query.data.data)}
          />
        </div>
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
