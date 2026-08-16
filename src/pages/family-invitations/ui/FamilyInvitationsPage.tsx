import { AnimatePresence, motion } from 'motion/react';
import { Check, Clock3, Inbox, MailCheck, RefreshCw, Send, UserRound, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  PrivateFamilyInvitationPanel,
  useAcceptFamilyInvitationMutation,
  useCancelFamilyInvitationMutation,
  useFindIncomingInvitationsQuery,
  useFindOutgoingInvitationsQuery,
  useRejectFamilyInvitationMutation,
} from '@/features/family-invitations';
import type { FamilyInvitationResponseDto } from '@/shared/api';
import { getApiErrorMessage } from '@/shared/api';
import { AnimatedPanel, AsyncState, Button, PageLayout } from '@/shared/ui';

type InvitationAction = 'accept' | 'cancel' | 'reject';
type InvitationDirection = 'incoming' | 'outgoing';
type Notice = { message: string; type: 'error' | 'success' };

const statusMeta: Record<
  FamilyInvitationResponseDto['status'],
  { className: string; label: string }
> = {
  ACCEPTED: {
    className: 'border-acid-green/35 bg-acid-green/10 text-acid-green',
    label: 'Принято',
  },
  CANCELLED: {
    className: 'border-muted-text/25 bg-muted-text/10 text-muted-text',
    label: 'Отменено',
  },
  EXPIRED: {
    className: 'border-electric-blue/35 bg-electric-blue/10 text-electric-blue',
    label: 'Истекло',
  },
  PENDING: {
    className: 'border-cyber-cyan/35 bg-cyber-cyan/10 text-cyber-cyan',
    label: 'Ожидает ответа',
  },
  REJECTED: {
    className: 'border-neon-pink/35 bg-neon-pink/10 text-neon-pink',
    label: 'Отклонено',
  },
};

const actionLabels: Record<InvitationAction, { loading: string; success: string }> = {
  accept: { loading: 'Принимаем…', success: 'Приглашение принято. Семья создана.' },
  cancel: { loading: 'Отменяем…', success: 'Приглашение отменено.' },
  reject: { loading: 'Отклоняем…', success: 'Приглашение отклонено.' },
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));

const sortInvitations = (invitations: FamilyInvitationResponseDto[]) =>
  [...invitations].sort((left, right) => {
    if (left.status === 'PENDING' && right.status !== 'PENDING') return -1;
    if (left.status !== 'PENDING' && right.status === 'PENDING') return 1;
    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });

type InvitationCardProps = {
  activeAction: { id: string; type: InvitationAction } | null;
  direction: InvitationDirection;
  invitation: FamilyInvitationResponseDto;
  isMutating: boolean;
  onAction: (invitation: FamilyInvitationResponseDto, action: InvitationAction) => void;
};

const InvitationCard = ({
  activeAction,
  direction,
  invitation,
  isMutating,
  onAction,
}: InvitationCardProps) => {
  const person = direction === 'incoming' ? invitation.sender : invitation.recipient;
  const meta = statusMeta[invitation.status];
  const activeActionType = activeAction?.id === invitation.id ? activeAction.type : null;

  return (
    <motion.article
      animate={{ opacity: 1, y: 0 }}
      className="border-border bg-elevated/45 relative overflow-hidden rounded-2xl border p-4"
      initial={{ opacity: 0, y: 10 }}
      layout
    >
      <div className="bg-primary-neon/5 pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl" />
      <div className="relative flex flex-wrap items-start justify-between gap-gap">
        <div className="flex min-w-0 items-center gap-gap">
          <div className="border-primary-neon/35 bg-primary-neon/10 text-primary-neon grid h-11 w-11 shrink-0 place-items-center rounded-2xl border">
            <UserRound aria-hidden="true" className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-text truncate font-semibold">
              {person.firstName} {person.lastName}
            </h3>
            <p className="text-muted-text truncate text-xs">{person.email}</p>
          </div>
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-xs ${meta.className}`}>
          {meta.label}
        </span>
      </div>

      <div className="text-muted-text relative mt-4 flex flex-wrap gap-gap text-xs">
        <span className="inline-flex items-center gap-2.5">
          <Send aria-hidden="true" className="h-3.5 w-3.5" />
          <time dateTime={invitation.createdAt}>{formatDateTime(invitation.createdAt)}</time>
        </span>
        {invitation.status === 'PENDING' && (
          <span className="inline-flex items-center gap-2.5">
            <Clock3 aria-hidden="true" className="h-3.5 w-3.5" />
            до <time dateTime={invitation.expiresAt}>{formatDateTime(invitation.expiresAt)}</time>
          </span>
        )}
      </div>

      {invitation.status === 'PENDING' && (
        <div className="relative mt-4 flex flex-wrap gap-gap">
          {direction === 'incoming' ? (
            <>
              <Button disabled={isMutating} onClick={() => onAction(invitation, 'accept')} size="s">
                <span className="flex items-center gap-2.5">
                  <Check aria-hidden="true" className="h-4 w-4" />
                  {activeActionType === 'accept' ? actionLabels.accept.loading : 'Принять'}
                </span>
              </Button>
              <Button
                className="border-neon-pink/60 text-neon-pink hover:bg-neon-pink/10"
                disabled={isMutating}
                onClick={() => onAction(invitation, 'reject')}
                size="s"
              >
                <span className="flex items-center gap-2.5">
                  <X aria-hidden="true" className="h-4 w-4" />
                  {activeActionType === 'reject' ? actionLabels.reject.loading : 'Отклонить'}
                </span>
              </Button>
            </>
          ) : (
            <Button
              className="border-neon-pink/60 text-neon-pink hover:bg-neon-pink/10"
              disabled={isMutating}
              onClick={() => onAction(invitation, 'cancel')}
              size="s"
            >
              <span className="flex items-center gap-2.5">
                <X aria-hidden="true" className="h-4 w-4" />
                {activeActionType === 'cancel' ? actionLabels.cancel.loading : 'Отменить'}
              </span>
            </Button>
          )}
        </div>
      )}
    </motion.article>
  );
};

const InvitationListSkeleton = () => (
  <div className="space-y-3" aria-label="Загрузка приглашений" role="status">
    {[0, 1].map((item) => (
      <div
        className="border-border bg-elevated/35 h-36 animate-pulse rounded-2xl border"
        key={item}
      />
    ))}
  </div>
);

type InvitationColumnProps = {
  activeAction: InvitationCardProps['activeAction'];
  direction: InvitationDirection;
  error: unknown;
  invitations?: FamilyInvitationResponseDto[];
  isLoading: boolean;
  isMutating: boolean;
  onAction: InvitationCardProps['onAction'];
  onRetry: () => void;
};

const InvitationColumn = ({
  activeAction,
  direction,
  error,
  invitations,
  isLoading,
  isMutating,
  onAction,
  onRetry,
}: InvitationColumnProps) => {
  const isIncoming = direction === 'incoming';
  const sortedInvitations = useMemo(() => sortInvitations(invitations ?? []), [invitations]);
  const titleId = `${direction}-invitations-title`;

  const emptyState = (
    <div className="border-border bg-elevated/25 text-muted-text grid min-h-48 place-items-center rounded-2xl border border-dashed p-5 text-center">
      <div>
        {isIncoming ? (
          <Inbox aria-hidden="true" className="mx-auto mb-2 h-7 w-7" />
        ) : (
          <Send aria-hidden="true" className="mx-auto mb-2 h-7 w-7" />
        )}
        <p className="text-sm">
          {isIncoming ? 'Входящих приглашений нет' : 'Вы ещё никого не приглашали'}
        </p>
      </div>
    </div>
  );
  const content = (
    <AsyncState
      empty={emptyState}
      error={error}
      errorMessage="Не удалось загрузить приглашения"
      hasData={Boolean(invitations)}
      isLoading={isLoading}
      loading={<InvitationListSkeleton />}
      onRetry={onRetry}
    >
      <div className="space-y-3">
        {sortedInvitations.length > 0
          ? sortedInvitations.map((invitation) => (
              <InvitationCard
                activeAction={activeAction}
                direction={direction}
                invitation={invitation}
                isMutating={isMutating}
                key={invitation.id}
                onAction={onAction}
              />
            ))
          : emptyState}
      </div>
    </AsyncState>
  );

  return (
    <AnimatedPanel aria-labelledby={titleId} className="min-h-0 p-4 sm:p-5">
      <header className="mb-4 flex items-center gap-gap">
        <div className="border-primary-neon/35 bg-primary-neon/10 text-primary-neon grid h-10 w-10 place-items-center rounded-2xl border">
          {isIncoming ? (
            <Inbox aria-hidden="true" className="h-5 w-5" />
          ) : (
            <Send aria-hidden="true" className="h-5 w-5" />
          )}
        </div>
        <div>
          <h2 className="text-text font-semibold" id={titleId}>
            {isIncoming ? 'Входящие' : 'Исходящие'}
          </h2>
          <p className="text-muted-text text-xs">
            {isIncoming ? 'Приглашения, ожидающие вашего решения' : 'Отправленные вами приглашения'}
          </p>
        </div>
      </header>

      {content}
    </AnimatedPanel>
  );
};

export const FamilyInvitationsPage = () => {
  const navigate = useNavigate();
  const incoming = useFindIncomingInvitationsQuery();
  const outgoing = useFindOutgoingInvitationsQuery();
  const [acceptInvitation, acceptState] = useAcceptFamilyInvitationMutation();
  const [rejectInvitation, rejectState] = useRejectFamilyInvitationMutation();
  const [cancelInvitation, cancelState] = useCancelFamilyInvitationMutation();
  const [activeAction, setActiveAction] = useState<InvitationCardProps['activeAction']>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const isMutating = acceptState.isLoading || rejectState.isLoading || cancelState.isLoading;

  const handleAction = async (
    invitation: FamilyInvitationResponseDto,
    action: InvitationAction,
  ) => {
    setActiveAction({ id: invitation.id, type: action });
    setNotice(null);

    try {
      if (action === 'accept') {
        await acceptInvitation({ id: invitation.id }).unwrap();
      } else if (action === 'reject') {
        await rejectInvitation({ id: invitation.id }).unwrap();
      } else {
        await cancelInvitation({ id: invitation.id }).unwrap();
      }

      setNotice({ message: actionLabels[action].success, type: 'success' });

      if (action === 'accept') {
        navigate('/my_family');
      }
    } catch (error) {
      setNotice({
        message: getApiErrorMessage(error, 'Не удалось изменить статус приглашения'),
        type: 'error',
      });
    } finally {
      setActiveAction(null);
    }
  };

  const handleRefresh = () => {
    incoming.refetch();
    outgoing.refetch();
  };

  return (
    <PageLayout>
      <div className="w-full">
        <header className="page-header mb-5 flex flex-wrap items-end justify-between gap-gap">
          <div>
            <div className="text-primary-neon mb-2 flex items-center gap-gap text-xs font-semibold uppercase tracking-[0.2em]">
              <MailCheck aria-hidden="true" className="h-4 w-4" />
              Создание семьи
            </div>
            <h1 className="text-text text-2xl font-semibold sm:text-3xl">Приглашения</h1>
            <p className="text-muted-text mt-1 text-sm">
              Управляйте приглашениями и решениями о создании общего семейного пространства.
            </p>
          </div>
          <Button
            disabled={incoming.isFetching || outgoing.isFetching}
            onClick={handleRefresh}
            size="s"
          >
            <span className="flex items-center gap-gap">
              <RefreshCw
                aria-hidden="true"
                className={`h-4 w-4 ${incoming.isFetching || outgoing.isFetching ? 'animate-spin' : ''}`}
              />
              Обновить
            </span>
          </Button>
        </header>

        <AnimatePresence mode="wait">
          {notice && (
            <motion.p
              animate={{ opacity: 1, y: 0 }}
              className={`mb-4 rounded-xl border px-4 py-2.5 text-sm ${
                notice.type === 'success'
                  ? 'border-acid-green/35 bg-acid-green/10 text-acid-green'
                  : 'border-neon-pink/35 bg-neon-pink/10 text-neon-pink'
              }`}
              exit={{ opacity: 0, y: -6 }}
              initial={{ opacity: 0, y: -6 }}
              key={notice.message}
              role="status"
            >
              {notice.message}
            </motion.p>
          )}
        </AnimatePresence>

        <PrivateFamilyInvitationPanel />

        <div className="grid items-start gap-gap lg:grid-cols-2">
          <InvitationColumn
            activeAction={activeAction}
            direction="incoming"
            error={incoming.error}
            invitations={incoming.data}
            isLoading={incoming.isLoading}
            isMutating={isMutating}
            onAction={handleAction}
            onRetry={() => {
              incoming.refetch();
            }}
          />
          <InvitationColumn
            activeAction={activeAction}
            direction="outgoing"
            error={outgoing.error}
            invitations={outgoing.data}
            isLoading={outgoing.isLoading}
            isMutating={isMutating}
            onAction={handleAction}
            onRetry={() => {
              outgoing.refetch();
            }}
          />
        </div>
      </div>
    </PageLayout>
  );
};
