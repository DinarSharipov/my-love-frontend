import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { useRegisterMutation } from '@/features/auth/api';
import { getApiErrorMessage } from '@/features/auth/lib/getApiErrorMessage';
import { registerSchema, type RegisterFormValues } from '@/features/auth/model/schemas';
import { AuthFormLayout } from '@/features/auth/ui/AuthFormLayout';
import { FormStatus } from '@/features/auth/ui/FormStatus';
import { Button, Input, Select } from '@/shared/ui';
import type { SelectOption } from '@/shared/ui';

const genderOptions = [
  { label: 'Не указывать', value: 'NOT_SPECIFIED' },
  { label: 'Мужской', value: 'MALE' },
  { label: 'Женский', value: 'FEMALE' },
  { label: 'Другой', value: 'OTHER' },
] satisfies readonly SelectOption[];

export const RegisterForm = () => {
  const navigate = useNavigate();
  const [registerUser, { isLoading }] = useRegisterMutation();
  const [requestError, setRequestError] = useState<string>();
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<RegisterFormValues>({
    defaultValues: { gender: 'NOT_SPECIFIED' },
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setRequestError(undefined);

    try {
      await registerUser({
        birthDate: values.birthDate,
        email: values.email,
        firstName: values.firstName,
        gender: values.gender,
        lastName: values.lastName,
        password: values.password,
        phone: values.phone,
      }).unwrap();
      navigate('/main');
    } catch (error) {
      setRequestError(
        getApiErrorMessage(error, 'Не удалось зарегистрироваться. Попробуйте ещё раз.'),
      );
    }
  });

  return (
    <AuthFormLayout
      isWide
      subtitle="Создай профиль — остальное начнётся после первого шага"
      title="Регистрация"
    >
      <form className="space-y-5" noValidate onSubmit={onSubmit}>
        <div className="grid gap-5 md:grid-cols-2">
          <Input
            {...register('firstName')}
            autoComplete="given-name"
            error={errors.firstName?.message}
            label="Имя"
            placeholder="Ваше имя"
          />
          <Input
            {...register('lastName')}
            autoComplete="family-name"
            error={errors.lastName?.message}
            label="Фамилия"
            placeholder="Ваша фамилия"
          />
          <Input
            {...register('birthDate')}
            error={errors.birthDate?.message}
            label="Дата рождения"
            type="date"
          />
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
            label="Телефон"
            placeholder="+79991234567"
            type="tel"
          />
          <Input
            {...register('email')}
            autoComplete="email"
            error={errors.email?.message}
            label="Email"
            placeholder="you@example.com"
            type="email"
          />
          <Input
            {...register('password')}
            autoComplete="new-password"
            error={errors.password?.message}
            label="Пароль"
            placeholder="Минимум 8 символов"
            type="password"
          />
          <Input
            {...register('confirmPassword')}
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            label="Повторите пароль"
            placeholder="Повторите пароль"
            type="password"
          />
        </div>

        <FormStatus message={requestError} />

        <div className="flex justify-between gap-2">
          <Button onClick={() => navigate('/login')}>Войти</Button>
          <Button animateVariant="magnetic" disabled={isLoading} type="submit">
            {isLoading ? 'Создаём профиль…' : 'Зарегистрироваться'}
          </Button>
        </div>
      </form>
    </AuthFormLayout>
  );
};
