import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Copy, Link2, ShieldCheck, Unlink } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';

import {
  useCreatePrivateFamilyInvitationMutation,
  useFindOutgoingPrivateFamilyInvitationsQuery,
  useRevokePrivateFamilyInvitationMutation,
} from '@/features/family-invitations/api';
import {
  privateInvitationSchema,
  type PrivateInvitationFormValues,
} from '@/features/family-invitations/model/privateInvitationSchema';
import type {
  CreatedPrivateFamilyInvitationResponseDto,
  PrivateFamilyInvitationResponseDto,
} from '@/shared/api';
import { getApiErrorMessage } from '@/shared/api';
import { AnimatedPanel, Button, Input } from '@/shared/ui';

type Notice = { message: string; type: 'error' | 'success' };

const statusLabels: Record<PrivateFamilyInvitationResponseDto['status'], string> = {
  ACCEPTED: 'Принято',
  CANCELLED: 'Отозвано',
  EXPIRED: 'Истекло',
  PENDING: 'Активно',
  REJECTED: 'Отклонено',
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));

export const PrivateFamilyInvitationPanel = () => {
  const outgoing = useFindOutgoingPrivateFamilyInvitationsQuery();
  const [createInvitation, createState] = useCreatePrivateFamilyInvitationMutation();
  const [revokeInvitation, revokeState] = useRevokePrivateFamilyInvitationMutation();
  const [createdInvitation, setCreatedInvitation] =
    useState<CreatedPrivateFamilyInvitationResponseDto | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeInvitationId, setActiveInvitationId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<PrivateInvitationFormValues>({ resolver: zodResolver(privateInvitationSchema) });

  const onSubmit = handleSubmit(async ({ recipientEmail }) => {
    setNotice(null);
    setCreatedInvitation(null);
    setCopied(false);

    try {
      const invitation = await createInvitation({
        createPrivateFamilyInvitationDto: {
          recipientEmail: recipientEmail.trim().toLowerCase(),
        },
      }).unwrap();
      setCreatedInvitation(invitation);
      setNotice({
        message: 'Одноразовая ссылка создана. Передайте её указанному партнёру.',
        type: 'success',
      });
      reset();
    } catch (error) {
      setNotice({
        message: getApiErrorMessage(error, 'Не удалось создать закрытое приглашение'),
        type: 'error',
      });
    }
  });

  const handleCopy = async () => {
    if (!createdInvitation) return;

    try {
      await navigator.clipboard.writeText(createdInvitation.inviteUrl);
      setCopied(true);
      setNotice({ message: 'Ссылка скопирована', type: 'success' });
    } catch {
      setNotice({ message: 'Не удалось скопировать ссылку автоматически', type: 'error' });
    }
  };

  const handleRevoke = async (invitation: PrivateFamilyInvitationResponseDto) => {
    setActiveInvitationId(invitation.id);
    setNotice(null);

    try {
      await revokeInvitation({ id: invitation.id }).unwrap();
      if (createdInvitation?.id === invitation.id) setCreatedInvitation(null);
      setNotice({
        message: 'Ссылка отозвана и больше не может быть использована',
        type: 'success',
      });
    } catch (error) {
      setNotice({
        message: getApiErrorMessage(error, 'Не удалось отозвать приглашение'),
        type: 'error',
      });
    } finally {
      setActiveInvitationId(null);
    }
  };

  let outgoingContent: ReactNode;
  if (outgoing.isLoading) {
    outgoingContent = <div className="border-border h-24 animate-pulse rounded-xl border" />;
  } else if (outgoing.error && !outgoing.data) {
    outgoingContent = (
      <div className="text-neon-pink py-5 text-center text-xs">Не удалось загрузить ссылки</div>
    );
  } else if (outgoing.data?.length) {
    outgoingContent = (
      <div className="max-h-52 space-y-2 overflow-auto pr-1">
        {outgoing.data.map((invitation) => (
          <article
            className="border-border bg-surface/65 flex items-center justify-between gap-3 rounded-xl border p-3"
            key={invitation.id}
          >
            <div className="min-w-0">
              <p className="text-text truncate text-xs font-medium">{invitation.recipientEmail}</p>
              <p className="text-muted-text mt-1 text-[11px]">
                {statusLabels[invitation.status]} · до {formatDateTime(invitation.expiresAt)}
              </p>
            </div>
            {invitation.status === 'PENDING' && (
              <Button
                aria-label={`Отозвать приглашение для ${invitation.recipientEmail}`}
                className="border-neon-pink/50 text-neon-pink hover:bg-neon-pink/10"
                disabled={revokeState.isLoading}
                onClick={() => handleRevoke(invitation)}
                size="s"
              >
                <Unlink aria-hidden="true" className="h-4 w-4" />
                <span className="sr-only">
                  {activeInvitationId === invitation.id ? 'Отзываем…' : 'Отозвать'}
                </span>
              </Button>
            )}
          </article>
        ))}
      </div>
    );
  } else {
    outgoingContent = (
      <p className="text-muted-text py-6 text-center text-xs">Закрытых приглашений пока нет</p>
    );
  }

  return (
    <AnimatedPanel className="mb-5 overflow-hidden p-4 sm:p-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)]">
        <div>
          <header className="mb-4 flex items-start gap-3">
            <div className="border-cyber-cyan/35 bg-cyber-cyan/10 text-cyber-cyan grid h-10 w-10 shrink-0 place-items-center rounded-2xl border">
              <ShieldCheck aria-hidden="true" className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-text font-semibold">Закрытое приглашение</h2>
              <p className="text-muted-text mt-1 text-xs leading-relaxed">
                Ссылка одноразовая и сработает только для аккаунта с указанным email.
              </p>
            </div>
          </header>

          <form
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
            noValidate
            onSubmit={onSubmit}
          >
            <Input
              {...register('recipientEmail')}
              autoComplete="email"
              containerClassName="flex-1"
              error={errors.recipientEmail?.message}
              label="Email партнёра"
              placeholder="partner@example.com"
              type="email"
            />
            <Button
              className="min-h-12"
              containerClassName="sm:pb-px"
              disabled={createState.isLoading}
              type="submit"
            >
              <span className="flex items-center gap-2">
                <Link2 aria-hidden="true" className="h-4 w-4" />
                {createState.isLoading ? 'Создаём…' : 'Создать ссылку'}
              </span>
            </Button>
          </form>

          <AnimatePresence mode="wait">
            {notice && (
              <motion.p
                animate={{ opacity: 1, y: 0 }}
                className={`mt-3 rounded-xl border px-3 py-2 text-xs ${
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

          {createdInvitation && (
            <div className="border-primary-neon/30 bg-primary-neon/5 mt-4 rounded-2xl border p-3">
              <p className="text-muted-text mb-2 text-xs">
                Сохраните ссылку сейчас: позднее полный токен не показывается.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  aria-label="Одноразовая ссылка приглашения"
                  className="text-xs"
                  readOnly
                  value={createdInvitation.inviteUrl}
                />
                <Button onClick={handleCopy} size="s">
                  <span className="flex items-center gap-2">
                    {copied ? (
                      <Check aria-hidden="true" className="h-4 w-4" />
                    ) : (
                      <Copy aria-hidden="true" className="h-4 w-4" />
                    )}
                    {copied ? 'Скопировано' : 'Копировать'}
                  </span>
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="border-border/80 bg-elevated/35 rounded-2xl border p-3">
          <h3 className="text-text mb-3 text-sm font-semibold">Выданные ссылки</h3>
          {outgoingContent}
        </div>
      </div>
    </AnimatedPanel>
  );
};
