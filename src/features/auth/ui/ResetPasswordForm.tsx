import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'motion/react';
import { KeyRound, LogIn } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';

import { useResetPasswordMutation } from '@/features/auth/api';
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/features/auth/model/schemas';
import { AuthFormLayout } from '@/features/auth/ui/AuthFormLayout';
import { FormStatus } from '@/features/auth/ui/FormStatus';
import { getApiErrorMessage } from '@/shared/api';
import { Button, Input } from '@/shared/ui';

const tokenPattern = /^[A-Za-z0-9_-]{32,128}$/;

export const ResetPasswordForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = new URLSearchParams(location.search).get('token') ?? '';
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [requestError, setRequestError] = useState<string>();
  const [isCompleted, setIsCompleted] = useState(false);
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema) });

  const onSubmit = handleSubmit(async ({ newPassword }) => {
    setRequestError(undefined);

    if (!tokenPattern.test(token)) {
      setRequestError('Ссылка восстановления недействительна или повреждена.');
      return;
    }

    try {
      await resetPassword({ resetPasswordDto: { newPassword, token } }).unwrap();
      setIsCompleted(true);
    } catch (error) {
      setRequestError(
        getApiErrorMessage(error, 'Ссылка недействительна, истекла или уже использована.'),
      );
    }
  });

  return (
    <AuthFormLayout
      subtitle="Придумай новый пароль для безопасного доступа к семье"
      title="Новый пароль"
    >
      {isCompleted ? (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5 text-center"
          initial={{ opacity: 0, y: 8 }}
        >
          <div className="border-acid-green/35 bg-acid-green/10 text-acid-green mx-auto grid h-14 w-14 place-items-center rounded-2xl border">
            <KeyRound aria-hidden="true" className="h-7 w-7" />
          </div>
          <p className="text-muted-text text-sm leading-relaxed">
            Пароль изменён. Все активные сессии отозваны, войдите заново.
          </p>
          <Button className="w-full" containerClassName="w-full" onClick={() => navigate('/login')}>
            <span className="flex items-center justify-center gap-gap">
              <LogIn aria-hidden="true" className="h-4 w-4" />
              Перейти ко входу
            </span>
          </Button>
        </motion.div>
      ) : (
        <form className="space-y-5" noValidate onSubmit={onSubmit}>
          <Input
            {...register('newPassword')}
            autoComplete="new-password"
            error={errors.newPassword?.message}
            hint="Минимум 8 символов"
            label="Новый пароль"
            placeholder="Введите новый пароль"
            type="password"
          />
          <Input
            {...register('confirmPassword')}
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            label="Повторите пароль"
            placeholder="Повторите новый пароль"
            type="password"
          />
          <FormStatus message={requestError} />
          <Button className="w-full" containerClassName="w-full" disabled={isLoading} type="submit">
            {isLoading ? 'Сохраняем…' : 'Сохранить новый пароль'}
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
      )}
    </AuthFormLayout>
  );
};
