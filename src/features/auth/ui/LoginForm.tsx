import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';

import { useLoginMutation } from '@/features/auth/api';
import { loginSchema, type LoginFormValues } from '@/features/auth/model/schemas';
import { getAuthRedirect } from '@/features/auth/lib/getAuthRedirect';
import { AuthFormLayout } from '@/features/auth/ui/AuthFormLayout';
import { FormStatus } from '@/features/auth/ui/FormStatus';
import { getApiErrorMessage } from '@/shared/api';
import { Button, Input } from '@/shared/ui';

export const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [login, { isLoading }] = useLoginMutation();
  const [requestError, setRequestError] = useState<string>();
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setRequestError(undefined);

    try {
      await login({ loginDto: values }).unwrap();
      navigate(getAuthRedirect(location.search), { replace: true });
    } catch (error) {
      setRequestError(getApiErrorMessage(error, 'Не удалось войти. Проверьте данные.'));
    }
  });

  return (
    <AuthFormLayout subtitle="Введи данные, чтобы продолжить" title="Войти">
      <form className="space-y-5 flex flex-col" noValidate onSubmit={onSubmit}>
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
          autoComplete="current-password"
          error={errors.password?.message}
          label="Пароль"
          placeholder="Введите пароль"
          type="password"
        />

        <FormStatus message={requestError} />
        <Button
          containerClassName="self-center"
          className="w-[300px]"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? 'Входим…' : 'Войти'}
        </Button>
        <div className="flex items-center justify-between gap-3 w-full">
          <Button onClick={() => navigate(`/auth${location.search}`)}>Регистрация</Button>
          <Button onClick={() => navigate('/restore')}>Забыли пароль?</Button>
        </div>
      </form>
    </AuthFormLayout>
  );
};
