import { motion } from 'motion/react';
import { HeartHandshake, LogIn, ShieldCheck, UserPlus } from 'lucide-react';
import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import { selectAccessToken } from '@/entities/user';
import { useAcceptPrivateFamilyInvitationMutation } from '@/features/family-invitations';
import { getApiErrorMessage } from '@/shared/api';
import { createId } from '@/shared/lib/id';
import { AnimatedPanel, Button } from '@/shared/ui';

const getInvitationToken = (hash: string) => new URLSearchParams(hash.slice(1)).get('token') ?? '';

export const JoinFamilyPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = Boolean(useSelector(selectAccessToken));
  const token = getInvitationToken(location.hash);
  const idempotencyKey = useRef(`closed-invite-${createId()}`);
  const [acceptInvitation, { isLoading }] = useAcceptPrivateFamilyInvitationMutation();
  const [error, setError] = useState<string | null>(null);
  const returnTo = `${location.pathname}${location.hash}`;
  const authQuery = `?next=${encodeURIComponent(returnTo)}`;
  const hasValidTokenShape = token.length >= 32 && token.length <= 256;

  const handleAccept = async () => {
    setError(null);

    try {
      await acceptInvitation({
        'Idempotency-Key': idempotencyKey.current,
        acceptPrivateFamilyInvitationDto: { token },
      }).unwrap();
      navigate('/my_family', { replace: true });
    } catch (acceptError) {
      setError(
        getApiErrorMessage(
          acceptError,
          'Не удалось принять приглашение. Проверьте ссылку или аккаунт.',
        ),
      );
    }
  };

  let actionContent: ReactNode;
  if (!hasValidTokenShape) {
    actionContent = (
      <div className="border-neon-pink/35 bg-neon-pink/10 text-neon-pink mt-6 rounded-2xl border p-4 text-center text-sm">
        В ссылке нет корректного токена приглашения. Попросите партнёра создать новую.
      </div>
    );
  } else if (isAuthenticated) {
    actionContent = (
      <div className="mt-6 text-center">
        <div className="border-acid-green/25 bg-acid-green/5 text-muted-text mb-4 flex items-start gap-gap rounded-2xl border p-4 text-left text-xs leading-relaxed">
          <ShieldCheck aria-hidden="true" className="text-acid-green mt-0.5 h-4 w-4 shrink-0" />
          После подтверждения будет создано общее семейное пространство для двух партнёров. Ссылка
          сразу перестанет действовать.
        </div>
        {error && (
          <p
            className="border-neon-pink/35 bg-neon-pink/10 text-neon-pink mb-4 rounded-xl border px-4 py-2.5 text-sm"
            role="alert"
          >
            {error}
          </p>
        )}
        <Button animateVariant="magnetic" disabled={isLoading} onClick={handleAccept}>
          {isLoading ? 'Подтверждаем…' : 'Принять приглашение'}
        </Button>
      </div>
    );
  } else {
    actionContent = (
      <div className="mt-6">
        <p className="text-muted-text mb-4 text-center text-sm">
          Сначала войдите в аккаунт с нужным email или зарегистрируйтесь.
        </p>
        <div className="flex flex-col justify-center gap-gap sm:flex-row">
          <Button onClick={() => navigate(`/login${authQuery}`)}>
            <span className="flex items-center gap-gap">
              <LogIn aria-hidden="true" className="h-4 w-4" />
              Войти
            </span>
          </Button>
          <Button onClick={() => navigate(`/auth${authQuery}`)}>
            <span className="flex items-center gap-gap">
              <UserPlus aria-hidden="true" className="h-4 w-4" />
              Зарегистрироваться
            </span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <AnimatedPanel className="w-full p-6 sm:p-8">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.35 }}
        >
          <div className="border-primary-neon/35 bg-primary-neon/10 text-primary-neon mx-auto grid h-14 w-14 place-items-center rounded-2xl border shadow-[0_0_28px_rgba(176,38,255,0.2)]">
            <HeartHandshake aria-hidden="true" className="h-7 w-7" />
          </div>
          <div className="mt-5 text-center">
            <p className="text-cyber-cyan text-xs font-semibold uppercase tracking-[0.2em]">
              Закрытое пространство
            </p>
            <h1 className="text-text mt-2 text-2xl font-semibold sm:text-3xl">
              Приглашение в семью
            </h1>
            <p className="text-muted-text mx-auto mt-3 text-sm leading-relaxed">
              Принять приглашение сможет только аккаунт с email, для которого была создана эта
              одноразовая ссылка.
            </p>
          </div>

          {actionContent}
        </motion.div>
      </AnimatedPanel>
    </main>
  );
};
