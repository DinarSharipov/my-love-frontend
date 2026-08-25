import { Archive, Plus, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  useArchiveRecurringPaymentMutation,
  useCreateRecurringPaymentMutation,
  useListFinanceWalletsQuery,
  useListArchivedRecurringPaymentsQuery,
  useListRecurringPaymentsQuery,
  useRestoreRecurringPaymentMutation,
} from '@/entities/finance';
import { getApiErrorMessage } from '@/shared/api';
import { AnimatedPanel, AsyncState, Button, DatePicker, Input, Select } from '@/shared/ui';

export const RecurringTab = () => {
  const [showArchived, setShowArchived] = useState(false);
  const activeQuery = useListRecurringPaymentsQuery(undefined, { skip: showArchived });
  const archivedQuery = useListArchivedRecurringPaymentsQuery(undefined, { skip: !showArchived });
  const query = showArchived ? archivedQuery : activeQuery;
  const wallets = useListFinanceWalletsQuery();
  const [create, state] = useCreateRecurringPaymentMutation();
  const [archive] = useArchiveRecurringPaymentMutation();
  const [restore] = useRestoreRecurringPaymentMutation();
  const [walletId, setWalletId] = useState('');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [frequency, setFrequency] = useState<'WEEKLY' | 'MONTHLY'>('MONTHLY');
  const [error, setError] = useState<string>();
  useEffect(() => {
    if (!walletId && wallets.data?.[0]) setWalletId(wallets.data[0].id);
  }, [walletId, wallets.data]);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!walletId || !title.trim() || !/^[1-9]\d{0,18}$/.test(amount) || !date) return;
    try {
      await create({
        walletId,
        type: 'EXPENSE',
        title: title.trim(),
        amountMinor: amount,
        frequency,
        nextDueAt: new Date(date).toISOString(),
      }).unwrap();
      setTitle('');
      setAmount('');
      setDate('');
    } catch (e) {
      setError(getApiErrorMessage(e, 'Не удалось создать регулярный платёж'));
    }
  };
  return (
    <AsyncState
      error={query.error || wallets.error}
      errorMessage="Не удалось загрузить регулярные платежи"
      hasData={Boolean(query.data && wallets.data)}
      isLoading={query.isLoading || wallets.isLoading}
      onRetry={() => {
        query.refetch();
        wallets.refetch();
      }}
    >
      <AnimatedPanel className="p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-text text-lg font-semibold">Регулярные платежи</h2>
          <Button onClick={() => setShowArchived((value) => !value)} size="s">
            {showArchived ? <RotateCcw className="size-4" /> : <Archive className="size-4" />}
            {showArchived ? 'К активным' : 'Архив платежей'}
          </Button>
        </div>
        <div className="mb-3 grid gap-2 sm:grid-cols-2">
          {(query.data ?? []).map((payment) => (
            <div
              className="bg-surface flex items-center justify-between gap-3 rounded-panel p-3"
              key={payment.id}
            >
              <div className="min-w-0">
                <div className="text-text truncate">{payment.title}</div>
                <div className="text-muted-text text-sm">
                  {payment.amountMinor} minor units ·{' '}
                  {payment.frequency === 'MONTHLY' ? 'Ежемесячно' : 'Еженедельно'}
                </div>
              </div>
              <Button
                icon={
                  showArchived ? <RotateCcw className="size-4" /> : <Archive className="size-4" />
                }
                onClick={() =>
                  showArchived
                    ? restore({ id: payment.id, version: payment.version })
                    : archive({ id: payment.id, version: payment.version })
                }
                size="s"
              >
                Архивировать
              </Button>
            </div>
          ))}
        </div>
        <form className="grid items-end gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]" onSubmit={submit}>
          <Input
            label="Название"
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ипотека"
            value={title}
          />
          <Input
            label="Сумма (minor units)"
            inputMode="numeric"
            onChange={(event) => setAmount(event.target.value)}
            value={amount}
          />
          <DatePicker
            id="recurring-date"
            label="Следующая дата"
            onChange={(event) => setDate(event.target.value)}
            value={date}
            withTime
          />
          <Button
            disabled={state.isLoading}
            icon={<Plus className="size-4" />}
            size="s"
            type="submit"
          >
            Добавить
          </Button>
        </form>
        <Select
          className="mt-3 max-w-xs"
          label="Периодичность"
          onChange={(value) => setFrequency(value as 'WEEKLY' | 'MONTHLY')}
          options={[
            { label: 'Ежемесячно', value: 'MONTHLY' },
            { label: 'Еженедельно', value: 'WEEKLY' },
          ]}
          value={frequency}
        />
        {error && <p className="text-neon-pink mt-2 text-sm">{error}</p>}
      </AnimatedPanel>
    </AsyncState>
  );
};
