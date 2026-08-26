import { Archive, Bell, CalendarClock, Pencil, Plus, RotateCcw, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  useArchiveRecurringPaymentMutation,
  useCreateRecurringPaymentMutation,
  useListArchivedRecurringPaymentsQuery,
  useListFinancialCategoriesQuery,
  useListFinanceWalletsQuery,
  useListRecurringPaymentForecastsQuery,
  useListRecurringPaymentsQuery,
  useRestoreRecurringPaymentMutation,
  useUpdateRecurringPaymentMutation,
} from '@/entities/finance';
import { getApiErrorMessage, useFindMyFamilyQuery } from '@/shared/api';
import {
  AnimatedPanel,
  AsyncState,
  Button,
  DatePicker,
  Input,
  Select,
  Textarea,
} from '@/shared/ui';

const formatDateTimeLocal = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const localTime = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localTime.toISOString().slice(0, 16);
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  );

export const RecurringTab = () => {
  const [showArchived, setShowArchived] = useState(false);
  const activeQuery = useListRecurringPaymentsQuery(undefined, { skip: showArchived });
  const archivedQuery = useListArchivedRecurringPaymentsQuery(undefined, { skip: !showArchived });
  const query = showArchived ? archivedQuery : activeQuery;
  const wallets = useListFinanceWalletsQuery();
  const family = useFindMyFamilyQuery();
  const [create, createState] = useCreateRecurringPaymentMutation();
  const [update, updateState] = useUpdateRecurringPaymentMutation();
  const [archive] = useArchiveRecurringPaymentMutation();
  const [restore] = useRestoreRecurringPaymentMutation();
  const [walletId, setWalletId] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const categories = useListFinancialCategoriesQuery(type);
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [frequency, setFrequency] = useState<'WEEKLY' | 'MONTHLY'>('MONTHLY');
  const [interval, setPaymentInterval] = useState('1');
  const [note, setNote] = useState('');
  const [reminderOffsetMinutes, setReminderOffsetMinutes] = useState('');
  const [reminderRecipientIds, setReminderRecipientIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingVersion, setEditingVersion] = useState<number>();
  const [selectedForecastId, setSelectedForecastId] = useState<string | null>(null);
  const forecastQuery = useListRecurringPaymentForecastsQuery(selectedForecastId ?? '', {
    skip: !selectedForecastId,
  });
  const [error, setError] = useState<string>();

  const familyMembers = useMemo(
    () =>
      (family.data?.members ?? []).map(({ user }) => ({
        id: user.id,
        name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email,
      })),
    [family.data?.members],
  );
  const walletOptions = useMemo(
    () =>
      (wallets.data ?? []).map((wallet) => ({
        label: `${wallet.name} · ${wallet.currency}`,
        value: wallet.id,
      })),
    [wallets.data],
  );
  const categoryOptions = useMemo(
    () => [
      { label: 'Без категории', value: '' },
      ...(categories.data ?? []).map((category) => ({
        label: category.name,
        value: category.id,
      })),
    ],
    [categories.data],
  );
  const isSubmitting = createState.isLoading || updateState.isLoading;

  useEffect(() => {
    if (!walletId && wallets.data?.[0]) setWalletId(wallets.data[0].id);
  }, [walletId, wallets.data]);

  const resetForm = () => {
    setEditingId(null);
    setEditingVersion(undefined);
    setType('EXPENSE');
    setCategoryId('');
    setTitle('');
    setAmount('');
    setDate('');
    setFrequency('MONTHLY');
    setPaymentInterval('1');
    setNote('');
    setReminderOffsetMinutes('');
    setReminderRecipientIds([]);
  };

  const startEditing = (payment: NonNullable<typeof query.data>[number]) => {
    setEditingId(payment.id);
    setEditingVersion(payment.version);
    setWalletId(payment.walletId);
    setType(payment.type);
    setCategoryId(payment.categoryId ?? '');
    setTitle(payment.title);
    setAmount(payment.amountMinor);
    setDate(formatDateTimeLocal(payment.nextDueAt));
    setFrequency(payment.frequency);
    setPaymentInterval(String(payment.interval));
    setNote(payment.note ?? '');
    setReminderOffsetMinutes(
      payment.reminderOffsetMinutes == null ? '' : String(payment.reminderOffsetMinutes),
    );
    setReminderRecipientIds(payment.reminderRecipientIds ?? []);
    setError(undefined);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(undefined);
    const parsedInterval = Number(interval);
    const parsedReminderOffset = reminderOffsetMinutes.trim()
      ? Number(reminderOffsetMinutes)
      : undefined;

    if (!walletId || !title.trim() || !/^[1-9]\d{0,18}$/.test(amount) || !date) {
      setError('Заполните кошелёк, название, сумму и дату следующего платежа');
      return;
    }
    if (!Number.isInteger(parsedInterval) || parsedInterval < 1 || parsedInterval > 120) {
      setError('Интервал должен быть целым числом от 1 до 120');
      return;
    }
    if (
      parsedReminderOffset !== undefined &&
      (!Number.isInteger(parsedReminderOffset) ||
        parsedReminderOffset < 0 ||
        parsedReminderOffset > 525600)
    ) {
      setError('Смещение напоминания должно быть от 0 до 525600 минут');
      return;
    }

    const common = {
      title: title.trim(),
      amountMinor: amount,
      categoryId: categoryId || undefined,
      frequency,
      interval: parsedInterval,
      nextDueAt: new Date(date).toISOString(),
      note: note.trim() || undefined,
      reminderOffsetMinutes: parsedReminderOffset,
      reminderRecipientIds: reminderRecipientIds.length ? reminderRecipientIds : undefined,
    };

    try {
      if (editingId) {
        await update({
          id: editingId,
          version: editingVersion,
          ...common,
          categoryId: categoryId || null,
          note: note.trim(),
          reminderOffsetMinutes: parsedReminderOffset ?? null,
        }).unwrap();
      } else {
        await create({ walletId, type, ...common }).unwrap();
      }
      resetForm();
    } catch (cause) {
      setError(
        getApiErrorMessage(
          cause,
          editingId
            ? 'Не удалось сохранить регулярный платёж'
            : 'Не удалось создать регулярный платёж',
        ),
      );
    }
  };

  const renderForecastContent = () => {
    if (forecastQuery.isLoading) {
      return <p className="text-muted-text text-sm">Загружаем прогноз…</p>;
    }
    if (forecastQuery.error) {
      return (
        <p className="text-neon-pink text-sm">
          {getApiErrorMessage(forecastQuery.error, 'Не удалось загрузить прогноз')}
        </p>
      );
    }
    if (!forecastQuery.data?.length) {
      return <p className="text-muted-text text-sm">Прогноз пока не сформирован.</p>;
    }
    return (
      <div className="space-y-2">
        {forecastQuery.data.map((forecast) => (
          <div className="flex items-center justify-between gap-3 text-sm" key={forecast.id}>
            <span className="text-text">{formatDateTime(forecast.dueAt)}</span>
            <span className="text-muted-text inline-flex items-center gap-1">
              <Bell className="size-3.5" />
              {formatDateTime(forecast.reminderAt)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const handleArchiveToggle = (payment: NonNullable<typeof query.data>[number]) => {
    if (showArchived) {
      restore({ id: payment.id, version: payment.version });
      return;
    }
    archive({ id: payment.id, version: payment.version });
  };

  return (
    <AsyncState
      error={query.error || wallets.error || categories.error || family.error}
      errorMessage="Не удалось загрузить регулярные платежи"
      hasData={Boolean(query.data && wallets.data && categories.data && family.data)}
      isLoading={query.isLoading || wallets.isLoading || categories.isLoading || family.isLoading}
      onRetry={() => {
        query.refetch();
        wallets.refetch();
        categories.refetch();
        family.refetch();
      }}
    >
      <AnimatedPanel className="p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-text text-lg font-semibold">Регулярные платежи</h2>
            <p className="text-muted-text mt-1 text-sm">
              Планы доходов и расходов с прогнозом ближайших дат.
            </p>
          </div>
          <Button
            icon={showArchived ? <RotateCcw className="size-4" /> : <Archive className="size-4" />}
            onClick={() => {
              setShowArchived((value) => !value);
              resetForm();
            }}
            size="s"
          >
            {showArchived ? 'К активным' : 'Архив платежей'}
          </Button>
        </div>

        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          {(query.data ?? []).map((payment) => {
            const isForecastOpen = selectedForecastId === payment.id;
            return (
              <div className="bg-surface rounded-panel p-3" key={payment.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-text truncate font-medium">{payment.title}</div>
                    <div className="text-muted-text mt-1 text-sm">
                      {payment.type === 'INCOME' ? 'Доход' : 'Расход'} · {payment.amountMinor} minor
                      units
                    </div>
                    <div className="text-muted-text text-sm">
                      Каждые {payment.interval} {payment.frequency === 'MONTHLY' ? 'мес.' : 'нед.'}{' '}
                      · следующее {formatDateTime(payment.nextDueAt)}
                    </div>
                    {payment.note && (
                      <p className="text-muted-text mt-2 line-clamp-2 text-sm">{payment.note}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-wrap justify-end gap-2">
                    {!showArchived && (
                      <Button
                        icon={<Pencil className="size-4" />}
                        onClick={() => startEditing(payment)}
                        size="s"
                      >
                        Изменить
                      </Button>
                    )}
                    <Button
                      icon={
                        showArchived ? (
                          <RotateCcw className="size-4" />
                        ) : (
                          <Archive className="size-4" />
                        )
                      }
                      onClick={() => handleArchiveToggle(payment)}
                      size="s"
                    >
                      {showArchived ? 'Восстановить' : 'Архивировать'}
                    </Button>
                  </div>
                </div>
                <Button
                  className="mt-3"
                  icon={<CalendarClock className="size-4" />}
                  onClick={() => setSelectedForecastId(isForecastOpen ? null : payment.id)}
                  size="s"
                >
                  {isForecastOpen ? 'Скрыть прогноз' : 'Показать прогноз'}
                </Button>
                {isForecastOpen && (
                  <div className="border-border mt-3 rounded-xl border p-3">
                    {renderForecastContent()}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <form className="space-y-3" onSubmit={submit}>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-text font-semibold">
              {editingId ? 'Изменить регулярный платёж' : 'Добавить регулярный платёж'}
            </h3>
            {editingId && (
              <Button icon={<X className="size-4" />} onClick={resetForm} size="s" type="button">
                Отмена
              </Button>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {!editingId && (
              <Select
                label="Тип"
                onChange={(value) => setType(value as 'INCOME' | 'EXPENSE')}
                options={[
                  { label: 'Расход', value: 'EXPENSE' },
                  { label: 'Доход', value: 'INCOME' },
                ]}
                value={type}
              />
            )}
            {!editingId && (
              <Select
                label="Кошелёк"
                onChange={setWalletId}
                options={walletOptions}
                value={walletId}
              />
            )}
            <Select
              label="Категория"
              onChange={setCategoryId}
              options={categoryOptions}
              value={categoryId}
            />
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
            <Select
              label="Периодичность"
              onChange={(value) => setFrequency(value as 'WEEKLY' | 'MONTHLY')}
              options={[
                { label: 'Ежемесячно', value: 'MONTHLY' },
                { label: 'Еженедельно', value: 'WEEKLY' },
              ]}
              value={frequency}
            />
            <Input
              hint="От 1 до 120 периодов"
              label="Интервал"
              max={120}
              min={1}
              onChange={(event) => setPaymentInterval(event.target.value)}
              type="number"
              value={interval}
            />
          </div>
          <Textarea
            label="Заметка"
            maxLength={500}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Например, оплата по договору"
            rows={2}
            value={note}
          />
          <fieldset className="border-border bg-elevated/35 rounded-panel border p-3">
            <legend className="text-text px-1 text-sm font-semibold">Напоминание</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                hint="Оставьте пустым, чтобы не отправлять"
                label="За сколько минут"
                max={525600}
                min={0}
                onChange={(event) => setReminderOffsetMinutes(event.target.value)}
                type="number"
                value={reminderOffsetMinutes}
              />
              <div>
                <p className="text-muted-text mb-2 text-sm">Получатели</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {familyMembers.map((member) => (
                    <label
                      className="border-border bg-surface/60 text-text flex items-center gap-2 rounded-xl border p-2 text-sm"
                      htmlFor={`recurring-recipient-${member.id}`}
                      key={member.id}
                    >
                      <input
                        checked={reminderRecipientIds.includes(member.id)}
                        id={`recurring-recipient-${member.id}`}
                        onChange={(event) =>
                          setReminderRecipientIds((current) =>
                            event.target.checked
                              ? [...current, member.id]
                              : current.filter((id) => id !== member.id),
                          )
                        }
                        type="checkbox"
                      />
                      <span>{member.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </fieldset>
          {error && (
            <p className="text-neon-pink text-sm" role="alert">
              {error}
            </p>
          )}
          <Button
            disabled={isSubmitting}
            icon={<Plus className="size-4" />}
            isLoading={isSubmitting}
            size="s"
            type="submit"
          >
            {editingId ? 'Сохранить' : 'Добавить'}
          </Button>
        </form>
      </AnimatedPanel>
    </AsyncState>
  );
};
