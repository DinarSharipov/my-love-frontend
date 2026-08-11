import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { useRestorePasswordMutation } from '@/features/auth/api';
import { getApiErrorMessage } from '@/features/auth/lib/getApiErrorMessage';
import { restoreSchema, type RestoreFormValues } from '@/features/auth/model/schemas';
import { AuthFormLayout } from '@/features/auth/ui/AuthFormLayout';
import { FormStatus } from '@/features/auth/ui/FormStatus';
import { Button, Input } from '@/shared/ui';

export const RestoreForm = () => {
  const navigate = useNavigate();
  const [restorePassword, { isLoading }] = useRestorePasswordMutation();
  const [requestError, setRequestError] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string>();
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<RestoreFormValues>({ resolver: zodResolver(restoreSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setRequestError(undefined);
    setSuccessMessage(undefined);

    try {
      const response = await restorePassword(values).unwrap();
      setSuccessMessage(
        response.message || 'Инструкции по восстановлению отправлены на указанную почту.',
      );
    } catch (error) {
      setRequestError(
        getApiErrorMessage(
          error,
          'Сервис восстановления пока недоступен. Попробуйте немного позже.',
        ),
      );
    }
  });

  return (
    <AuthFormLayout
      subtitle="Укажи email — мы отправим ссылку для создания нового пароля"
      title="Восстановить пароль"
    >
      <form className="space-y-5" noValidate onSubmit={onSubmit}>
        <Input
          {...register('email')}
          autoComplete="email"
          error={errors.email?.message}
          label="Email"
          placeholder="you@example.com"
          type="email"
        />

        <FormStatus message={requestError} />
        <FormStatus message={successMessage} variant="success" />

        <Button className="w-full" containerClassName="w-full" disabled={isLoading} type="submit">
          {isLoading ? 'Отправляем…' : 'Восстановить пароль'}
        </Button>
        <Button
          className="w-full"
          containerClassName="w-full"
          onClick={() => navigate('/login')}
          size="s"
        >
          Вернуться ко входу
        </Button>
      </form>
    </AuthFormLayout>
  );
};
