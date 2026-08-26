import { ArrowDownToLine, ArrowUpFromLine, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  useCreateExpenseMutation,
  useCreateIncomeMutation,
  useCreateFinancialCategoryMutation,
  useListFinanceWalletsQuery,
  useListFinancialCategoriesQuery,
} from '@/entities/finance';
import { getApiErrorMessage } from '@/shared/api';
import { createId } from '@/shared/lib/id';
import { AnimatedPanel, AsyncState, Button, DatePicker, Input, Select } from '@/shared/ui';

const makeKey = () => `${Date.now()}-${createId()}`;
export const OperationTab = () => {
  const wallets = useListFinanceWalletsQuery();
  const categories = useListFinancialCategoriesQuery();
  const [income, incomeState] = useCreateIncomeMutation();
  const [expense, expenseState] = useCreateExpenseMutation();
  const [createCategory, categoryState] = useCreateFinancialCategoryMutation();
  const [walletId, setWalletId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [kind, setKind] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [categoryName, setCategoryName] = useState('');
  const [error, setError] = useState<string>();
  useEffect(() => {
    if (!walletId && wallets.data?.[0]) setWalletId(wallets.data[0].id);
  }, [walletId, wallets.data]);
  const submit = async (
    event: React.MouseEvent<HTMLButtonElement>,
    operation: 'income' | 'expense',
  ) => {
    event.preventDefault();
    if (!walletId || !/^[1-9]\d{0,18}$/.test(amount)) {
      setError('Выберите кошелёк и укажите положительную сумму.');
      return;
    }
    try {
      const selected = categories.data?.find((category) => category.id === categoryId);
      const body = {
        walletId,
        amountMinor: amount,
        occurredAt: date ? new Date(date).toISOString() : undefined,
        note: note.trim() || undefined,
        categoryId:
          selected?.kind === (operation === 'income' ? 'INCOME' : 'EXPENSE')
            ? categoryId
            : undefined,
      };
      await (operation === 'income' ? income : expense)({ body, key: makeKey() }).unwrap();
      setAmount('');
      setDate('');
      setNote('');
      setCategoryId('');
      setError(undefined);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Не удалось сохранить операцию'));
    }
  };
  const addCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!categoryName.trim()) return;
    try {
      await createCategory({ name: categoryName.trim(), kind }).unwrap();
      setCategoryName('');
    } catch (e) {
      setError(getApiErrorMessage(e, 'Не удалось создать категорию'));
    }
  };
  return (
    <AsyncState
      error={wallets.error || categories.error}
      errorMessage="Не удалось загрузить данные операции"
      hasData={Boolean(wallets.data && categories.data)}
      isLoading={wallets.isLoading || categories.isLoading}
      onRetry={() => {
        wallets.refetch();
        categories.refetch();
      }}
    >
      <div className="grid gap-gap">
        <AnimatedPanel className="p-5">
          <h2 className="text-text mb-3 text-lg font-semibold">Новая операция</h2>
          <div className="flex flex-col gap-gap">
            <Select
              label="Кошелёк"
              onChange={setWalletId}
              options={(wallets.data ?? []).map((wallet) => ({
                label: wallet.name,
                value: wallet.id,
              }))}
              value={walletId}
            />
            <Input
              label="Сумма (minor units)"
              inputMode="numeric"
              onChange={(event) => setAmount(event.target.value)}
              placeholder="125000"
              value={amount}
            />
            <div className="grid gap-gap sm:grid-cols-2">
              <DatePicker
                id="finance-date"
                label="Дата"
                onChange={(event) => setDate(event.target.value)}
                value={date}
                withTime
              />
              <Select
                label="Категория"
                onChange={setCategoryId}
                options={[
                  { label: 'Без категории', value: '' },
                  ...(categories.data ?? [])
                    .filter((category) => category.kind === kind)
                    .map((category) => ({ label: category.name, value: category.id })),
                ]}
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
                  setKind('INCOME');
                  setCategoryId('');
                  submit(event, 'income');
                }}
              >
                Доход
              </Button>
              <Button
                disabled={expenseState.isLoading || !walletId}
                icon={<ArrowDownToLine className="size-4" />}
                onClick={(event) => {
                  setKind('EXPENSE');
                  setCategoryId('');
                  submit(event, 'expense');
                }}
              >
                Расход
              </Button>
            </div>
            {error && (
              <p className="text-neon-pink text-sm" role="alert">
                {error}
              </p>
            )}
          </div>
        </AnimatedPanel>
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
              onChange={(value) => setKind(value as 'INCOME' | 'EXPENSE')}
              options={[
                { label: 'Расход', value: 'EXPENSE' },
                { label: 'Доход', value: 'INCOME' },
              ]}
              value={kind}
            />
            <Button
              disabled={categoryState.isLoading}
              icon={<Plus className="size-4" />}
              type="submit"
            >
              Добавить
            </Button>
          </form>
        </AnimatedPanel>
      </div>
    </AsyncState>
  );
};
