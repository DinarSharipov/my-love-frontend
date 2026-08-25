import { Archive, Plus, RotateCcw, WalletCards } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  useArchiveFinancialGoalMutation,
  useContributeFinancialGoalMutation,
  useCreateFinancialGoalMutation,
  useListFinanceWalletsQuery,
  useListFinancialGoalsQuery,
  useListArchivedFinancialGoalsQuery,
  useRestoreFinancialGoalMutation,
} from '@/entities/finance';
import { getApiErrorMessage } from '@/shared/api';
import { AnimatedPanel, AsyncState, Button, DatePicker, Input, Select } from '@/shared/ui';

const positiveAmount = /^[1-9]\d{0,18}$/;

export const GoalsTab = () => {
  const [showArchived, setShowArchived] = useState(false);
  const activeQuery = useListFinancialGoalsQuery(undefined, { skip: showArchived });
  const archivedQuery = useListArchivedFinancialGoalsQuery(undefined, { skip: !showArchived });
  const query = showArchived ? archivedQuery : activeQuery;
  const wallets = useListFinanceWalletsQuery();
  const [create, createState] = useCreateFinancialGoalMutation();
  const [contribute, contributeState] = useContributeFinancialGoalMutation();
  const [archive] = useArchiveFinancialGoalMutation();
  const [restore] = useRestoreFinancialGoalMutation();
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [date, setDate] = useState('');
  const [walletId, setWalletId] = useState('');
  const [amount, setAmount] = useState('');
  const [activeGoalId, setActiveGoalId] = useState('');
  const [error, setError] = useState<string>();
  useEffect(() => {
    if (!walletId && wallets.data?.[0]) setWalletId(wallets.data[0].id);
  }, [walletId, wallets.data]);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !positiveAmount.test(target)) {
      setError('Укажите название и положительную сумму цели.');
      return;
    }
    try {
      await create({
        title: title.trim(),
        targetAmountMinor: target,
        type: 'PERSONAL',
        targetDate: date || undefined,
      }).unwrap();
      setTitle('');
      setTarget('');
      setDate('');
      setError(undefined);
    } catch (cause) {
      setError(getApiErrorMessage(cause, 'Не удалось создать цель'));
    }
  };
  const submitContribution = async (event: React.FormEvent, goalId: string) => {
    event.preventDefault();
    if (!walletId || !positiveAmount.test(amount)) {
      setError('Выберите кошелёк и укажите положительную сумму.');
      return;
    }
    try {
      await contribute({
        id: goalId,
        fromWalletId: walletId,
        amountMinor: amount,
        key: `goal-${goalId}-${Date.now()}`,
      }).unwrap();
      setAmount('');
      setActiveGoalId('');
      setError(undefined);
    } catch (cause) {
      setError(getApiErrorMessage(cause, 'Не удалось пополнить цель'));
    }
  };
  return (
    <AsyncState
      error={query.error || wallets.error}
      errorMessage="Не удалось загрузить финансовые цели"
      hasData={Boolean(query.data && wallets.data)}
      isLoading={query.isLoading || wallets.isLoading}
      onRetry={() => {
        query.refetch();
        wallets.refetch();
      }}
    >
      <AnimatedPanel className="p-5">
        <div className="mb-3 flex items-center gap-gap">
          <WalletCards className="text-cyber-cyan size-5" />
          <h2 className="text-text text-lg font-semibold">Финансовые цели</h2>
        </div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <Button onClick={() => setShowArchived((value) => !value)} size="s">
            {showArchived ? <RotateCcw className="size-4" /> : <Archive className="size-4" />}
            {showArchived ? 'К активным' : 'Архив целей'}
          </Button>
        </div>
        <div className="mb-3 grid gap-2 sm:grid-cols-2">
          {(query.data ?? [])
            .filter((goal) => (showArchived ? goal.archived : !goal.archived))
            .map((goal) => (
              <div className="bg-surface rounded-panel p-3" key={goal.id}>
                <div className="flex items-center justify-between gap-2">
                  <div className="text-text truncate">{goal.title}</div>
                  <Button
                    icon={
                      showArchived ? (
                        <RotateCcw className="size-4" />
                      ) : (
                        <Archive className="size-4" />
                      )
                    }
                    onClick={() =>
                      showArchived
                        ? restore({ id: goal.id, version: goal.version })
                        : archive({ id: goal.id, version: goal.version })
                    }
                    size="s"
                    title="Архивировать цель"
                  />
                </div>
                <div className="text-muted-text text-sm">
                  {goal.currentAmountMinor} / {goal.targetAmountMinor} {goal.currency}
                </div>
                {activeGoalId === goal.id ? (
                  <form
                    className="mt-2 flex items-end gap-2"
                    onSubmit={(event) => submitContribution(event, goal.id)}
                  >
                    <Input
                      label="Сумма"
                      inputMode="numeric"
                      onChange={(event) => setAmount(event.target.value)}
                      value={amount}
                    />
                    <Button disabled={contributeState.isLoading} size="s" type="submit">
                      Пополнить
                    </Button>
                  </form>
                ) : (
                  <Button className="mt-2" onClick={() => setActiveGoalId(goal.id)} size="s">
                    Пополнить цель
                  </Button>
                )}
              </div>
            ))}
        </div>
        <Select
          label="Кошелёк для пополнения"
          onChange={setWalletId}
          options={(wallets.data ?? []).map((wallet) => ({ label: wallet.name, value: wallet.id }))}
          value={walletId}
        />
        <form
          className="mt-3 grid items-end gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]"
          onSubmit={submit}
        >
          <Input
            label="Название цели"
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Отпуск"
            value={title}
          />
          <Input
            label="Цель (minor units)"
            inputMode="numeric"
            onChange={(event) => setTarget(event.target.value)}
            placeholder="500000"
            value={target}
          />
          <DatePicker
            id="goal-date"
            label="Дата цели"
            onChange={(event) => setDate(event.target.value)}
            value={date}
          />
          <Button
            disabled={createState.isLoading}
            icon={<Plus className="size-4" />}
            size="s"
            type="submit"
          >
            Добавить
          </Button>
        </form>
        {error && (
          <p className="text-neon-pink mt-2 text-sm" role="alert">
            {error}
          </p>
        )}
      </AnimatedPanel>
    </AsyncState>
  );
};
