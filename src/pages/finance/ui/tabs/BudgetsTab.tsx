import { Archive, Pencil, Plus, Save, X } from 'lucide-react';
import { useState } from 'react';
import {
  useArchiveFinancialBudgetMutation,
  useCreateFinancialBudgetMutation,
  useListFinancialBudgetsQuery,
  useListFinancialCategoriesQuery,
  useUpdateFinancialBudgetMutation,
} from '@/entities/finance';
import { getApiErrorMessage } from '@/shared/api';
import { AnimatedPanel, AsyncState, Button, Input, Select } from '@/shared/ui';

const positiveAmount = /^[1-9]\d{0,18}$/;

export const BudgetsTab = () => {
  const budgets = useListFinancialBudgetsQuery();
  const categories = useListFinancialCategoriesQuery();
  const [create, createState] = useCreateFinancialBudgetMutation();
  const [update, updateState] = useUpdateFinancialBudgetMutation();
  const [archive] = useArchiveFinancialBudgetMutation();
  const [categoryId, setCategoryId] = useState('');
  const [limit, setLimit] = useState('');
  const [editingId, setEditingId] = useState('');
  const [error, setError] = useState<string>();
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!categoryId || !positiveAmount.test(limit)) {
      setError('Выберите категорию и укажите положительный лимит.');
      return;
    }
    try {
      await create({
        categoryId,
        limitMinor: limit,
        periodStart: `${new Date().toISOString().slice(0, 7)}-01`,
      }).unwrap();
      setCategoryId('');
      setLimit('');
      setError(undefined);
    } catch (cause) {
      setError(getApiErrorMessage(cause, 'Не удалось создать бюджет'));
    }
  };
  const save = async (id: string, version: number) => {
    if (!positiveAmount.test(limit)) {
      setError('Укажите положительный лимит.');
      return;
    }
    try {
      await update({ id, limitMinor: limit, version }).unwrap();
      setEditingId('');
      setLimit('');
      setError(undefined);
    } catch (cause) {
      setError(getApiErrorMessage(cause, 'Не удалось обновить бюджет'));
    }
  };
  return (
    <AsyncState
      error={budgets.error || categories.error}
      errorMessage="Не удалось загрузить бюджеты"
      hasData={Boolean(budgets.data && categories.data)}
      isLoading={budgets.isLoading || categories.isLoading}
      onRetry={() => {
        budgets.refetch();
        categories.refetch();
      }}
    >
      <AnimatedPanel className="p-5">
        <h2 className="text-text mb-3 text-lg font-semibold">Бюджеты на месяц</h2>
        <div className="mb-3 grid gap-2 sm:grid-cols-2">
          {(budgets.data ?? []).map((budget) => (
            <div className="bg-surface rounded-panel p-3" key={budget.id}>
              <div className="flex items-center justify-between gap-2">
                <div className="text-text">
                  {categories.data?.find((category) => category.id === budget.categoryId)?.name ??
                    'Категория'}
                </div>
                <div className="flex gap-1">
                  <Button
                    icon={<Pencil className="size-4" />}
                    onClick={() => {
                      setEditingId(budget.id);
                      setLimit(budget.limitMinor);
                    }}
                    size="s"
                    title="Изменить бюджет"
                  />
                  <Button
                    icon={<Archive className="size-4" />}
                    onClick={() => archive({ id: budget.id, version: budget.version })}
                    size="s"
                    title="Архивировать бюджет"
                  />
                </div>
              </div>
              {editingId === budget.id ? (
                <div className="mt-2 flex items-end gap-2">
                  <Input
                    label="Лимит"
                    inputMode="numeric"
                    onChange={(event) => setLimit(event.target.value)}
                    value={limit}
                  />
                  <Button
                    disabled={updateState.isLoading}
                    icon={<Save className="size-4" />}
                    onClick={() => save(budget.id, budget.version)}
                    size="s"
                    title="Сохранить"
                  />
                  <Button
                    icon={<X className="size-4" />}
                    onClick={() => {
                      setEditingId('');
                      setLimit('');
                    }}
                    size="s"
                    title="Отменить"
                  />
                </div>
              ) : (
                <div className="text-muted-text text-sm">{budget.limitMinor} minor units</div>
              )}
            </div>
          ))}
        </div>
        <form className="grid items-end gap-2 sm:grid-cols-[1fr_1fr_auto]" onSubmit={submit}>
          <Select
            label="Категория"
            onChange={setCategoryId}
            options={(categories.data ?? [])
              .filter((category) => category.kind === 'EXPENSE')
              .map((category) => ({ label: category.name, value: category.id }))}
            value={categoryId}
          />
          <Input
            label="Лимит (minor units)"
            inputMode="numeric"
            onChange={(event) => setLimit(event.target.value)}
            value={editingId ? '' : limit}
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
