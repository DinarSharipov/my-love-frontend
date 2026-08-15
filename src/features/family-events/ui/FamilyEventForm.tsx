import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { Save, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  useCreateFamilyEventMutation,
  useUpdateFamilyEventMutation,
} from '@/features/family-events/api/familyEventsApi';
import { toFamilyEventInstant } from '@/features/family-events/lib/familyEventDate';
import {
  createFamilyEventSchema,
  type FamilyEventFormValues,
} from '@/features/family-events/model/familyEventSchema';
import type { FamilyEventResponseDto } from '@/shared/api';
import { getApiErrorMessage } from '@/shared/api';
import { Button, Input, Textarea } from '@/shared/ui';

dayjs.extend(utc);
dayjs.extend(timezone);

type FamilyEventFormProps = {
  initialDate?: string;
  initialValue?: FamilyEventResponseDto;
  mode: 'create' | 'edit';
  onCancel: () => void;
  onSuccess: (value: FamilyEventResponseDto) => void;
  timeZone: string;
};

const getDefaultValues = ({
  initialDate,
  initialValue,
  timeZone,
}: Pick<
  FamilyEventFormProps,
  'initialDate' | 'initialValue' | 'timeZone'
>): FamilyEventFormValues => {
  const zonedDate = initialValue
    ? dayjs(initialValue.scheduledAt).tz(timeZone)
    : dayjs().tz(timeZone).add(1, 'hour').startOf('hour');

  return {
    date: initialDate ?? zonedDate.format('YYYY-MM-DD'),
    description: initialValue?.description ?? '',
    location: initialValue?.location ?? '',
    name: initialValue?.name ?? '',
    time: initialValue ? zonedDate.format('HH:mm') : '18:00',
  };
};

export const FamilyEventForm = ({
  initialDate,
  initialValue,
  mode,
  onCancel,
  onSuccess,
  timeZone,
}: FamilyEventFormProps) => {
  const [createFamilyEvent, createState] = useCreateFamilyEventMutation();
  const [updateFamilyEvent, updateState] = useUpdateFamilyEventMutation();
  const [requestError, setRequestError] = useState<string>();
  const schema = useMemo(() => createFamilyEventSchema(timeZone), [timeZone]);
  const defaultValues = useMemo(
    () => getDefaultValues({ initialDate, initialValue, timeZone }),
    [initialDate, initialValue, timeZone],
  );
  const {
    formState: { errors, isDirty },
    handleSubmit,
    register,
    reset,
  } = useForm<FamilyEventFormValues>({
    defaultValues,
    resolver: zodResolver(schema),
  });
  const isSubmitting = createState.isLoading || updateState.isLoading;

  useEffect(() => reset(defaultValues), [defaultValues, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setRequestError(undefined);
    const payload = {
      description: values.description.trim(),
      location: values.location.trim(),
      name: values.name.trim(),
      scheduledAt: toFamilyEventInstant(values.date, values.time, timeZone),
    };

    try {
      const savedValue =
        mode === 'create'
          ? await createFamilyEvent({ createFamilyEventDto: payload }).unwrap()
          : await updateFamilyEvent({
              'If-Match': String(initialValue?.version),
              id: initialValue?.id ?? '',
              updateFamilyEventDto: payload,
            }).unwrap();

      onSuccess(savedValue);
    } catch (error) {
      setRequestError(
        getApiErrorMessage(
          error,
          mode === 'create' ? 'Не удалось создать событие' : 'Не удалось сохранить событие',
        ),
      );
    }
  });

  return (
    <form className="space-y-4" noValidate onSubmit={onSubmit}>
      <div>
        <p className="text-primary-neon text-xs font-semibold uppercase tracking-[0.2em]">
          {mode === 'create' ? 'Новое предложение' : 'Изменение планов'}
        </p>
        <h2 className="text-text mt-1 text-xl font-semibold">
          {mode === 'create' ? 'Добавить семейное событие' : 'Изменить событие'}
        </h2>
        {mode === 'edit' && (
          <p className="text-muted-text mt-2 text-xs leading-relaxed">
            После изменения партнёру потребуется подтвердить событие повторно.
          </p>
        )}
      </div>

      <Input
        {...register('name')}
        autoComplete="off"
        error={errors.name?.message}
        label="Название"
        maxLength={200}
        placeholder="Ужин, прогулка, поездка…"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input {...register('date')} error={errors.date?.message} label="Дата" type="date" />
        <Input {...register('time')} error={errors.time?.message} label="Время" type="time" />
      </div>

      <Input
        {...register('location')}
        autoComplete="off"
        error={errors.location?.message}
        label="Место"
        maxLength={500}
        placeholder="Адрес или название места"
      />

      <Textarea
        {...register('description')}
        error={errors.description?.message}
        hint="Необязательно, до 2000 символов"
        label="Описание"
        maxLength={2000}
        placeholder="Детали, которые важно не забыть"
        rows={4}
      />

      {requestError && (
        <p
          className="border-neon-pink/35 bg-neon-pink/10 text-neon-pink rounded-xl border px-4 py-2.5 text-sm"
          role="alert"
        >
          {requestError}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button disabled={isSubmitting || (mode === 'edit' && !isDirty)} size="s" type="submit">
          <span className="flex items-center gap-1.5">
            <Save aria-hidden="true" className="h-4 w-4" />
            {isSubmitting ? 'Сохраняем…' : 'Сохранить'}
          </span>
        </Button>
        <Button disabled={isSubmitting} onClick={onCancel} size="s">
          <span className="flex items-center gap-1.5">
            <X aria-hidden="true" className="h-4 w-4" />
            Отмена
          </span>
        </Button>
      </div>
    </form>
  );
};
