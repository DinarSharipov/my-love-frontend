import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'motion/react';
import { RefreshCw, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { useUpdateCurrentUserMutation } from '@/features/profile/api';
import { profileSchema, type ProfileFormValues } from '@/features/profile/model/profileSchema';
import type { UserResponseDto } from '@/shared/api';
import { getApiErrorMessage } from '@/shared/api';
import { Button, Input, Select, Textarea } from '@/shared/ui';
import type { SelectOption } from '@/shared/ui';

type Notice = { message: string; type: 'error' | 'success' };

type ProfileFormProps = {
  onRefresh: () => void;
  user: UserResponseDto;
};

const genderOptions = [
  { label: 'Не указывать', value: 'NOT_SPECIFIED' },
  { label: 'Мужской', value: 'MALE' },
  { label: 'Женский', value: 'FEMALE' },
  { label: 'Другой', value: 'OTHER' },
] satisfies readonly SelectOption[];

const toFormValues = (user: UserResponseDto): ProfileFormValues => ({
  description: user.description ?? '',
  firstName: user.firstName,
  gender: user.gender,
  lastName: user.lastName,
  locale: user.locale,
  phone: user.phone ?? '',
  timeZone: user.timeZone,
});

const isVersionConflict = (error: unknown) =>
  Boolean(
    error &&
    typeof error === 'object' &&
    'data' in error &&
    typeof (error as { data?: unknown }).data === 'object' &&
    (error as { data?: { code?: unknown } }).data?.code === 'VERSION_CONFLICT',
  );

export const ProfileForm = ({ onRefresh, user }: ProfileFormProps) => {
  const [updateProfile, updateState] = useUpdateCurrentUserMutation();
  const [notice, setNotice] = useState<Notice | null>(null);
  const {
    control,
    formState: { errors, isDirty },
    handleSubmit,
    register,
    reset,
  } = useForm<ProfileFormValues>({
    defaultValues: toFormValues(user),
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    reset(toFormValues(user));
  }, [reset, user]);

  const onSubmit = handleSubmit(async (values) => {
    setNotice(null);

    try {
      await updateProfile({
        'If-Match': String(user.version),
        updateCurrentUserDto: {
          description: values.description || null,
          firstName: values.firstName.trim(),
          gender: values.gender,
          lastName: values.lastName.trim(),
          locale: values.locale.trim(),
          phone: values.phone || null,
          timeZone: values.timeZone.trim(),
        },
      }).unwrap();
      setNotice({ message: 'Профиль обновлён', type: 'success' });
    } catch (error) {
      if (isVersionConflict(error)) {
        setNotice({
          message: 'Профиль был изменён в другой вкладке. Данные обновлены — внесите правки снова.',
          type: 'error',
        });
        onRefresh();
        return;
      }

      setNotice({
        message: getApiErrorMessage(error, 'Не удалось сохранить профиль'),
        type: 'error',
      });
    }
  });

  return (
    <form className="space-y-5" noValidate onSubmit={onSubmit}>
      <div className="grid gap-gap sm:grid-cols-2">
        <Input {...register('firstName')} error={errors.firstName?.message} label="Имя" />
        <Input {...register('lastName')} error={errors.lastName?.message} label="Фамилия" />
        <Controller
          control={control}
          name="gender"
          render={({ field }) => (
            <Select
              ref={field.ref}
              error={errors.gender?.message}
              label="Пол"
              name={field.name}
              onBlur={field.onBlur}
              onChange={field.onChange}
              options={genderOptions}
              value={field.value}
            />
          )}
        />
        <Input
          {...register('phone')}
          autoComplete="tel"
          error={errors.phone?.message}
          hint="Можно оставить пустым"
          label="Телефон"
          placeholder="+79991234567"
          type="tel"
        />
        <Input
          {...register('locale')}
          error={errors.locale?.message}
          hint="Например, ru-RU"
          label="Язык и регион"
          placeholder="ru-RU"
        />
        <Input
          {...register('timeZone')}
          error={errors.timeZone?.message}
          hint="Например, Europe/Moscow"
          label="Часовой пояс"
          placeholder="Europe/Moscow"
        />
      </div>

      <Textarea
        {...register('description')}
        error={errors.description?.message}
        hint="До 2000 символов"
        label="О себе"
        placeholder="Несколько слов о себе — только если хочется поделиться"
        rows={5}
      />

      <AnimatePresence mode="wait">
        {notice && (
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl border px-4 py-2.5 text-sm ${
              notice.type === 'success'
                ? 'border-acid-green/35 bg-acid-green/10 text-acid-green'
                : 'border-neon-pink/35 bg-neon-pink/10 text-neon-pink'
            }`}
            exit={{ opacity: 0, y: -4 }}
            initial={{ opacity: 0, y: -4 }}
            key={`${notice.type}-${notice.message}`}
            role="status"
          >
            {notice.message}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center gap-gap">
        <Button
          animateVariant="magnetic"
          disabled={updateState.isLoading || !isDirty}
          type="submit"
        >
          <span className="flex items-center gap-gap">
            <Save aria-hidden="true" className="h-4 w-4" />
            {updateState.isLoading ? 'Сохраняем…' : 'Сохранить изменения'}
          </span>
        </Button>
        <Button
          disabled={updateState.isLoading || !isDirty}
          onClick={() => reset(toFormValues(user))}
          size="s"
        >
          <span className="flex items-center gap-gap">
            <RefreshCw aria-hidden="true" className="h-4 w-4" />
            Сбросить
          </span>
        </Button>
      </div>
    </form>
  );
};
