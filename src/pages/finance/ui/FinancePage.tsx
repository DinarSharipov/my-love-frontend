import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  Plus,
  RotateCcw,
  WalletCards,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import type { LedgerTransaction } from '@/entities/finance';
import {
  useCreateExpenseMutation,
  useCreateFinanceWalletMutation,
  useCreateFinancialCategoryMutation,
  useCreateIncomeMutation,
  useCreateTransferMutation,
  useGetFinancialSummaryQuery,
  useGetExpenseStatisticsQuery,
  useListFinancialCategoriesQuery,
  useListFinanceWalletsQuery,
  useListLedgerQuery,
  useReverseLedgerMutation,
} from '@/entities/finance';
import { getApiErrorMessage } from '@/shared/api';
import { AnimatedPanel, AsyncState, Button, Input, PageLayout, Select } from '@/shared/ui';

const makeKey = () => `${Date.now()}-${crypto.randomUUID()}`;
const labels: Record<LedgerTransaction['type'], string> = {
  INCOME: 'Доход',
  EXPENSE: 'Расход',
  TRANSFER: 'Перевод',
  REVERSAL: 'Отмена',
};

export const FinancePage = () => {
  const walletsQuery = useListFinanceWalletsQuery();
  const ledgerQuery = useListLedgerQuery({ page: 1, limit: 50 });
  const categoriesQuery = useListFinancialCategoriesQuery();
  const summaryQuery = useGetFinancialSummaryQuery();
  const expenseStatisticsQuery = useGetExpenseStatisticsQuery();
  const [createWallet, walletState] = useCreateFinanceWalletMutation();
  const [createCategory, categoryState] = useCreateFinancialCategoryMutation();
  const [income, incomeState] = useCreateIncomeMutation();
  const [expense, expenseState] = useCreateExpenseMutation();
  const [transfer, transferState] = useCreateTransferMutation();
  const [reverse] = useReverseLedgerMutation();
  const [walletId, setWalletId] = useState('');
  const [toWalletId, setToWalletId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [operationKind, setOperationKind] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [walletName, setWalletName] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [error, setError] = useState<string>();
  const wallets = useMemo(() => walletsQuery.data ?? [], [walletsQuery.data]);
  const transactions = useMemo(() => ledgerQuery.data?.data ?? [], [ledgerQuery.data?.data]);
  useEffect(() => {
    if (!walletId && wallets[0]) {
      setWalletId(wallets[0].id);
    }
  }, [walletId, wallets]);
  const refresh = () => {
    walletsQuery.refetch();
    ledgerQuery.refetch();
    summaryQuery.refetch();
    expenseStatisticsQuery.refetch();
  };
  const submit = async (event: FormEvent, kind: 'income' | 'expense' | 'transfer') => {
    event.preventDefault();
    if (!walletId || !/^[1-9]\d{0,18}$/.test(amount) || (kind === 'transfer' && !toWalletId))
      return;
    setError(undefined);
    try {
      const common = {
        amountMinor: amount,
        occurredAt: date ? new Date(date).toISOString() : undefined,
        note: note.trim() || undefined,
      };
      if (kind === 'transfer')
        await transfer({
          body: { ...common, fromWalletId: walletId, toWalletId },
          key: makeKey(),
        }).unwrap();
      else if (kind === 'income')
        await income({
          body: { ...common, walletId, categoryId: categoryId || undefined },
          key: makeKey(),
        }).unwrap();
      else
        await expense({
          body: { ...common, walletId, categoryId: categoryId || undefined },
          key: makeKey(),
        }).unwrap();
      setAmount('');
      setNote('');
      setDate('');
      refresh();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Не удалось сохранить операцию'));
    }
  };
  const addWallet = async (event: FormEvent) => {
    event.preventDefault();
    if (!walletName.trim()) return;
    try {
      await createWallet({ name: walletName.trim(), type: 'PERSONAL', currency: 'RUB' }).unwrap();
      setWalletName('');
      refresh();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Не удалось создать кошелёк'));
    }
  };
  const addCategory = async (event: FormEvent) => {
    event.preventDefault();
    if (!categoryName.trim()) return;
    try {
      await createCategory({ name: categoryName.trim(), kind: operationKind }).unwrap();
      setCategoryName('');
      categoriesQuery.refetch();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Не удалось создать категорию'));
    }
  };
  return (
    <PageLayout>
      <header className="page-header">
        <p className="text-cyber-cyan text-xs font-semibold uppercase tracking-[0.2em]">
          Семейные финансы
        </p>
        <h1 className="text-text mt-1 text-2xl font-semibold sm:text-3xl">Финансы</h1>
        <p className="text-muted-text mt-1 text-sm">Кошельки, операции и вклад участников.</p>
      </header>
      <AsyncState
        error={walletsQuery.error || ledgerQuery.error}
        errorMessage="Не удалось загрузить финансовые данные"
        hasData={Boolean(walletsQuery.data && ledgerQuery.data)}
        isLoading={walletsQuery.isLoading || ledgerQuery.isLoading}
        loading={<AnimatedPanel className="p-6">Загружаем финансы…</AnimatedPanel>}
        onRetry={refresh}
      >
        <div className="grid min-w-0 gap-gap lg:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)]">
          <div className="flex min-w-0 flex-col gap-gap">
            <AnimatedPanel className="p-5">
              <div className="mb-4 flex items-center gap-gap">
                <WalletCards className="text-cyber-cyan" />
                <h2 className="text-text text-lg font-semibold">Кошельки</h2>
              </div>
              {wallets.map((wallet) => (
                <button
                  className="border-border bg-surface text-text mb-2 flex w-full justify-between rounded-panel border p-3 text-left"
                  key={wallet.id}
                  onClick={() => setWalletId(wallet.id)}
                  type="button"
                >
                  <span>{wallet.name}</span>
                  <span className="text-muted-text text-sm">{wallet.currency}</span>
                </button>
              ))}
              <form className="mt-3 flex gap-gap" onSubmit={addWallet}>
                <Input
                  label=""
                  onChange={(event) => setWalletName(event.target.value)}
                  placeholder="Название кошелька"
                  value={walletName}
                />
                <Button disabled={walletState.isLoading} type="submit">
                  <Plus className="size-4" /> Добавить
                </Button>
              </form>
            </AnimatedPanel>
            <AnimatedPanel className="p-5">
              <h2 className="text-text mb-3 text-lg font-semibold">Новая операция</h2>
              <form className="flex flex-col gap-gap" onSubmit={(event) => submit(event, 'income')}>
                <Input
                  label="Сумма (minor units)"
                  inputMode="numeric"
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="125000"
                  value={amount}
                />
                <div className="grid gap-gap sm:grid-cols-2">
                  <label className="text-muted-text text-sm" htmlFor="finance-date">
                    Дата
                    <input
                      className="bg-surface border-border text-text rounded-panel mt-1 w-full border px-3 py-2"
                      id="finance-date"
                      onChange={(event) => setDate(event.target.value)}
                      type="datetime-local"
                      value={date}
                    />
                  </label>
                  <Select
                    label="Категория"
                    onChange={setCategoryId}
                    options={[
                      { label: 'Без категории', value: '' },
                      ...(categoriesQuery.data ?? [])
                        .filter((category) => category.kind === operationKind)
                        .map((category) => ({ label: category.name, value: category.id })),
                    ]}
                    placeholder="Выберите категорию"
                    value={categoryId}
                  />
                </div>
                <Input
                  label="Комментарий"
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Например, зарплата"
                  value={note}
                />
                <Select
                  label="Перевести в"
                  onChange={setToWalletId}
                  options={wallets
                    .filter((wallet) => wallet.id !== walletId)
                    .map((wallet) => ({ label: wallet.name, value: wallet.id }))}
                  placeholder="Выберите кошелёк для перевода"
                  value={toWalletId}
                />
                <div className="flex flex-wrap gap-gap">
                  <Button
                    disabled={incomeState.isLoading || !walletId}
                    onClick={(event) => {
                      setOperationKind('INCOME');
                      setCategoryId('');
                      submit(event, 'income');
                    }}
                    type="button"
                  >
                    <ArrowUpFromLine className="size-4" /> Доход
                  </Button>
                  <Button
                    disabled={expenseState.isLoading || !walletId}
                    onClick={(event) => {
                      setOperationKind('EXPENSE');
                      setCategoryId('');
                      submit(event, 'expense');
                    }}
                    type="button"
                  >
                    <ArrowDownToLine className="size-4" /> Расход
                  </Button>
                  <Button
                    disabled={transferState.isLoading || !toWalletId}
                    onClick={(event) => submit(event, 'transfer')}
                    type="button"
                  >
                    <ArrowLeftRight className="size-4" /> Перевод
                  </Button>
                </div>
                {error && (
                  <p className="text-neon-pink text-sm" role="alert">
                    {error}
                  </p>
                )}
              </form>
            </AnimatedPanel>
            <AnimatedPanel className="p-5">
              <h2 className="text-text mb-3 text-lg font-semibold">Категории</h2>
              <form className="flex gap-gap" onSubmit={addCategory}>
                <Input
                  label=""
                  onChange={(event) => setCategoryName(event.target.value)}
                  placeholder="Название категории"
                  value={categoryName}
                />
                <Select
                  label="Тип"
                  onChange={(value) => setOperationKind(value as 'INCOME' | 'EXPENSE')}
                  options={[
                    { label: 'Расход', value: 'EXPENSE' },
                    { label: 'Доход', value: 'INCOME' },
                  ]}
                  value={operationKind}
                />
                <Button disabled={categoryState.isLoading} type="submit">
                  <Plus className="size-4" /> Добавить
                </Button>
              </form>
            </AnimatedPanel>
            <AnimatedPanel className="p-5">
              <h2 className="text-text mb-3 text-lg font-semibold">Вклад участников</h2>
              {expenseStatisticsQuery.data?.members.length ? (
                expenseStatisticsQuery.data.members.map((member) => (
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
          <AnimatedPanel className="min-w-0 p-5">
            <h2 className="text-text mb-4 text-lg font-semibold">История операций</h2>
            {transactions.length ? (
              <div className="flex flex-col gap-gap">
                {transactions.map((transaction) => (
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
                        <button
                          className="text-muted-text hover:text-text"
                          onClick={async () => {
                            try {
                              await reverse({ id: transaction.id, key: makeKey() }).unwrap();
                              refresh();
                            } catch (requestError) {
                              setError(
                                getApiErrorMessage(requestError, 'Не удалось отменить операцию'),
                              );
                            }
                          }}
                          title="Отменить операцию"
                          type="button"
                        >
                          <RotateCcw className="size-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-text">Операций пока нет.</p>
            )}
          </AnimatedPanel>
        </div>
      </AsyncState>
    </PageLayout>
  );
};
