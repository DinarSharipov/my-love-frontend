import { zodResolver } from '@hookform/resolvers/zod';
import { Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  useCreateFirstDateMutation,
  useUpdateFirstDateMutation,
} from '@/features/first-date/api/firstDateApi';
import {
  firstDateSchema,
  type FirstDateFormValues,
} from '@/features/first-date/model/firstDateSchema';
import type { FirstDateResponseDto } from '@/shared/api';
import { getApiErrorMessage } from '@/shared/api';
import { Button, DatePicker, Input, Textarea } from '@/shared/ui';

type FirstDateFormProps = {
  initialValue?: FirstDateResponseDto;
  mode: 'create' | 'edit';
  onCancel: () => void;
  onSuccess: (mode: FirstDateFormProps['mode'], value: FirstDateResponseDto) => void;
};

const getDefaultValues = (initialValue?: FirstDateResponseDto): FirstDateFormValues => ({
  date: initialValue?.date.slice(0, 10) ?? '',
  description: typeof initialValue?.description === 'string' ? initialValue.description : '',
  name: initialValue?.name ?? '',
});

export const FirstDateForm = ({ initialValue, mode, onCancel, onSuccess }: FirstDateFormProps) => {
  const [createFirstDate, createState] = useCreateFirstDateMutation();
  const [updateFirstDate, updateState] = useUpdateFirstDateMutation();
  const [requestError, setRequestError] = useState<string>();
  const {
    formState: { errors, isDirty },
    handleSubmit,
    register,
    reset,
  } = useForm<FirstDateFormValues>({
    defaultValues: getDefaultValues(initialValue),
    resolver: zodResolver(firstDateSchema),
  });
  const isSubmitting = createState.isLoading || updateState.isLoading;

  useEffect(() => reset(getDefaultValues(initialValue)), [initialValue, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setRequestError(undefined);

    try {
      let savedValue: FirstDateResponseDto;

      if (mode === 'create') {
        savedValue = await createFirstDate({ createFirstDateDto: values }).unwrap();
      } else {
        savedValue = await updateFirstDate({
          'If-Match': String(initialValue?.version),
          updateFirstDateDto: values,
        }).unwrap();
      }

      onSuccess(mode, savedValue);
    } catch (error) {
      setRequestError(
        getApiErrorMessage(
          error,
          mode === 'create'
            ? 'Не удалось добавить дату первой встречи'
            : 'Не удалось сохранить изменения',
        ),
      );
    }
  });

  return (
    <form className="relative space-y-4" noValidate onSubmit={onSubmit}>
      <div>
        <div className="text-primary-neon text-xs font-semibold uppercase tracking-[0.2em]">
          {mode === 'create' ? 'Начало вашей истории' : 'Редактирование истории'}
        </div>
        <h2 className="text-text mt-1 text-lg font-semibold sm:text-xl">
          {mode === 'create' ? 'Добавьте первую встречу' : 'Измените первую встречу'}
        </h2>
      </div>

      <div className="grid gap-gap sm:grid-cols-[1fr_220px]">
        <Input
          {...register('name')}
          autoComplete="off"
          error={errors.name?.message}
          label="Название"
          maxLength={200}
          placeholder="Наше первое свидание"
        />
        <DatePicker {...register('date')} error={errors.date?.message} label="Дата" />
      </div>

      <Textarea
        {...register('description')}
        error={errors.description?.message}
        hint="Необязательно, до 2000 символов"
        label="Что вам особенно запомнилось"
        maxLength={2000}
        placeholder="Вечерняя прогулка, долгий разговор…"
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

      <div className="flex flex-wrap gap-gap">
        <Button disabled={isSubmitting || (mode === 'edit' && !isDirty)} icon={<Save aria-hidden="true" className="h-4 w-4" />} size="s" type="submit">
          <span>
            {isSubmitting ? 'Сохраняем…' : 'Сохранить'}
          </span>
        </Button>
        <Button disabled={isSubmitting} icon={<X aria-hidden="true" className="h-4 w-4" />} onClick={onCancel} size="s">
          <span>
            Отмена
          </span>
        </Button>
      </div>
    </form>
  );
};
