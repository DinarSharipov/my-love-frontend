import {
  ArrowDownToLine,
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
  useCreateFinancialGoalMutation,
  useCreateIncomeMutation,
  useCreateTransferMutation,
  useGetFinancialSummaryQuery,
  useGetExpenseStatisticsQuery,
  useListFinancialCategoriesQuery,
  useListFinancialGoalsQuery,
  useListFinancialBudgetsQuery,
  useCreateFinancialBudgetMutation,
  useListFinanceWalletsQuery,
  useListLedgerQuery,
  useReverseLedgerMutation,
} from '@/entities/finance';
import { getApiErrorMessage } from '@/shared/api';
import {
  AnimatedPanel,
  AsyncState,
  Button,
  DatePicker,
  Input,
  PageLayout,
  Select,
  Tabs,
} from '@/shared/ui';

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
  const [transfer] = useCreateTransferMutation();
  const [reverse] = useReverseLedgerMutation();
  const goalsQuery = useListFinancialGoalsQuery();
  const budgetsQuery = useListFinancialBudgetsQuery();
  const [createBudget, budgetState] = useCreateFinancialBudgetMutation();
  const [createGoal, goalState] = useCreateFinancialGoalMutation();
  const [walletId, setWalletId] = useState('');
  const [toWalletId, setToWalletId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [operationKind, setOperationKind] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [walletName, setWalletName] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalDate, setGoalDate] = useState('');
  const [budgetCategoryId, setBudgetCategoryId] = useState('');
  const [budgetLimit, setBudgetLimit] = useState('');
  const [error, setError] = useState<string>();
  const [activeTab, setActiveTab] = useState('wallets');
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
    if (!walletId) {
      setError('Сначала выберите кошелёк');
      return;
    }
    if (!/^[1-9]\d{0,18}$/.test(amount)) {
      setError('Введите положительную сумму в minor units, например 125000');
      return;
    }
    if (kind === 'transfer' && (!toWalletId || toWalletId === walletId)) {
      setError('Для перевода выберите другой кошелёк');
      return;
    }
    if (note.trim().length > 500) {
      setError('Комментарий не может быть длиннее 500 символов');
      return;
    }
    if (date && Number.isNaN(Date.parse(date))) {
      setError('Проверьте дату операции');
      return;
    }
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
          body: {
            ...common,
            walletId,
            categoryId:
              categoriesQuery.data?.find((category) => category.id === categoryId)?.kind ===
              'INCOME'
                ? categoryId
                : undefined,
          },
          key: makeKey(),
        }).unwrap();
      else
        await expense({
          body: {
            ...common,
            walletId,
            categoryId:
              categoriesQuery.data?.find((category) => category.id === categoryId)?.kind ===
              'EXPENSE'
                ? categoryId
                : undefined,
          },
          key: makeKey(),
        }).unwrap();
      setAmount('');
      setNote('');
      setDate('');
      setCategoryId('');
      setToWalletId('');
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
  const addGoal = async (event: FormEvent) => {
    event.preventDefault();
    if (!goalTitle.trim() || !/^[1-9]\d{0,18}$/.test(goalTarget)) {
      setError('Укажите название цели и положительную сумму в minor units');
      return;
    }
    try {
      await createGoal({ title: goalTitle.trim(), targetAmountMinor: goalTarget, type: 'PERSONAL', targetDate: goalDate || undefined }).unwrap();
      setGoalTitle(''); setGoalTarget(''); setGoalDate(''); setError(undefined);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Не удалось создать финансовую цель'));
    }
  };
  const addBudget = async (event: FormEvent) => {
    event.preventDefault();
    if (!budgetCategoryId || !/^[1-9]\d{0,18}$/.test(budgetLimit)) {
      setError('Выберите расходную категорию и укажите положительный лимит');
      return;
    }
    try {
      await createBudget({ categoryId: budgetCategoryId, periodStart: `${new Date().toISOString().slice(0, 7)}-01`, limitMinor: budgetLimit }).unwrap();
      setBudgetCategoryId(''); setBudgetLimit(''); setError(undefined);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Не удалось создать бюджет'));
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
        <div className="flex min-w-0 flex-col gap-gap">
          <Tabs
            activeId={activeTab}
            items={[
              { id: 'wallets', label: 'Кошельки' },
              { id: 'goals', label: 'Цели' },
              { id: 'budgets', label: 'Бюджеты' },
              { id: 'operation', label: 'Новая операция' },
              { id: 'history', label: 'История операций' },
            ]}
            onChange={setActiveTab}
          />
          <div className="grid min-w-0 gap-gap">
            <div className="flex min-w-0 flex-col gap-gap">
              {activeTab === 'wallets' && (
                <AnimatedPanel className="p-5">
                  <div className="mb-4 flex items-center gap-gap">
                    <WalletCards className="text-cyber-cyan" />
                    <h2 className="text-text text-lg font-semibold">Кошельки</h2>
                  </div>
                  {false && <div className="border-border mb-4 rounded-panel border p-4">
                    <h3 className="text-text mb-3 font-semibold">Финансовые цели</h3>
                    <div className="mb-3 grid gap-2 sm:grid-cols-2">
                      {(goalsQuery.data ?? []).map((goal) => (
                        <div className="bg-surface rounded-panel p-3" key={goal.id}>
                          <div className="text-text truncate">{goal.title}</div>
                          <div className="text-muted-text text-sm">{goal.currentAmountMinor} / {goal.targetAmountMinor} {goal.currency}</div>
                        </div>
                      ))}
                    </div>
                    <form className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]" onSubmit={addGoal}>
                      <Input label="Название цели" onChange={(event) => setGoalTitle(event.target.value)} placeholder="Отпуск" value={goalTitle} />
                      <Input label="Цель (minor units)" inputMode="numeric" onChange={(event) => setGoalTarget(event.target.value)} placeholder="500000" value={goalTarget} />
                      <DatePicker id="goal-date" label="Дата цели" onChange={(event) => setGoalDate(event.target.value)} value={goalDate} />
                      <Button disabled={goalState.isLoading} icon={<Plus className="size-4" />} type="submit">Добавить</Button>
                    </form>
                  </div>}
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
                  <form className="mt-3 flex items-end gap-gap" onSubmit={addWallet}>
                    <Input
                      label=""
                      onChange={(event) => setWalletName(event.target.value)}
                      placeholder="Название кошелька"
                      value={walletName}
                    />
                      <Button disabled={walletState.isLoading} icon={<Plus className="size-4" />} type="submit">
                      Добавить
                    </Button>
                  </form>
                </AnimatedPanel>
              )}
              {activeTab === 'goals' && (
                <AnimatedPanel className="p-5"><h2 className="text-text mb-3 text-lg font-semibold">Финансовые цели</h2><div className="mb-3 grid gap-2 sm:grid-cols-2">{(goalsQuery.data ?? []).map((goal) => <div className="bg-surface rounded-panel p-3" key={goal.id}><div className="text-text truncate">{goal.title}</div><div className="text-muted-text text-sm">{goal.currentAmountMinor} / {goal.targetAmountMinor} {goal.currency}</div></div>)}</div><form className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]" onSubmit={addGoal}><Input label="Название цели" onChange={(event) => setGoalTitle(event.target.value)} placeholder="Отпуск" value={goalTitle} /><Input label="Цель (minor units)" inputMode="numeric" onChange={(event) => setGoalTarget(event.target.value)} placeholder="500000" value={goalTarget} /><DatePicker id="goal-date" label="Дата цели" onChange={(event) => setGoalDate(event.target.value)} value={goalDate} /><Button disabled={goalState.isLoading} icon={<Plus className="size-4" />} size="s" type="submit">Добавить</Button></form></AnimatedPanel>
              )}
              {activeTab === 'budgets' && (
                <AnimatedPanel className="p-5"><h2 className="text-text mb-3 text-lg font-semibold">Бюджеты на месяц</h2><div className="mb-3 grid gap-2 sm:grid-cols-2">{(budgetsQuery.data ?? []).map((budget) => <div className="bg-surface rounded-panel p-3" key={budget.id}><div className="text-text">{categoriesQuery.data?.find((category) => category.id === budget.categoryId)?.name ?? 'Категория'}</div><div className="text-muted-text text-sm">{budget.limitMinor} minor units</div></div>)}</div><form className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]" onSubmit={addBudget}><Select label="Категория" onChange={setBudgetCategoryId} options={(categoriesQuery.data ?? []).filter((category) => category.kind === 'EXPENSE').map((category) => ({ label: category.name, value: category.id }))} placeholder="Выберите категорию" value={budgetCategoryId} /><Input label="Лимит (minor units)" inputMode="numeric" onChange={(event) => setBudgetLimit(event.target.value)} placeholder="500000" value={budgetLimit} /><Button disabled={budgetState.isLoading} icon={<Plus className="size-4" />} size="s" type="submit">Добавить</Button></form></AnimatedPanel>
              )}
              {activeTab === 'operation' && (
                <AnimatedPanel className="p-5">
                  <h2 className="text-text mb-3 text-lg font-semibold">Новая операция</h2>
                  <form
                    className="flex flex-col gap-gap"
                    onSubmit={(event) => submit(event, 'income')}
                  >
                    <Input
                      label="Сумма (minor units)"
                      inputMode="numeric"
                      onChange={(event) => setAmount(event.target.value)}
                      placeholder="125000"
                      value={amount}
                    />
                    <div className="grid gap-gap sm:grid-cols-2">
                      <div className="text-muted-text text-sm">
                        <span className="mb-2 block">Дата</span>
                        <DatePicker
                          id="finance-date"
                          onChange={(event) => setDate(event.target.value)}
                          value={date}
                          withTime
                        />
                      </div>
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
                    <div className="mt-4 flex flex-wrap justify-end gap-gap">
                      <Button
                        disabled={incomeState.isLoading || !walletId}
                        icon={<ArrowUpFromLine className="size-4" />}
                        onClick={(event) => {
                          setOperationKind('INCOME');
                          setCategoryId('');
                          submit(event, 'income');
                        }}
                        type="button"
                      >
                        Доход
                      </Button>
                      <Button
                        disabled={expenseState.isLoading || !walletId}
                        icon={<ArrowDownToLine className="size-4" />}
                        onClick={(event) => {
                          setOperationKind('EXPENSE');
                          setCategoryId('');
                          submit(event, 'expense');
                        }}
                        type="button"
                      >
                        Расход
                      </Button>
                    </div>
                    {error && (
                      <p className="text-neon-pink text-sm" role="alert">
                        {error}
                      </p>
                    )}
                  </form>
                </AnimatedPanel>
              )}
              {activeTab === 'operation' && (
                <AnimatedPanel className="p-5">
                  <h2 className="text-text mb-3 text-lg font-semibold">Категории</h2>
                  <form
                    className="grid items-end gap-gap sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
                    onSubmit={addCategory}
                  >
                    <Input
                      label="Название"
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
                    <Button disabled={categoryState.isLoading} icon={<Plus className="size-4" />} type="submit">
                      Добавить
                    </Button>
                  </form>
                </AnimatedPanel>
              )}
              {activeTab === 'wallets' && (
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
              )}
            </div>
            {activeTab === 'history' && (
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
                            {transaction.entries.find((entry) => entry.walletId)?.amountMinor ??
                              '—'}{' '}
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
                                    getApiErrorMessage(
                                      requestError,
                                      'Не удалось отменить операцию',
                                    ),
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
            )}
          </div>
        </div>
      </AsyncState>
    </PageLayout>
  );
};
