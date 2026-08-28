import { skipToken } from '@reduxjs/toolkit/query';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Clock3,
  HeartHandshake,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';

import {
  getApiErrorMessage,
  useAcceptMutation,
  useConfirmRealizationMutation,
  useCreate16Mutation,
  useFindCurrentUserQuery,
  useFindMyFamilyQuery,
  useFindOne3Query,
  useList17Query,
  useMarkRealizedMutation,
  useRejectMutation,
  useRejectRealizationMutation,
  useRemove7Mutation,
  useUpdate12Mutation,
} from '@/shared/api';
import type { FamilyWishResponseDto } from '@/shared/api';
import {
  AnimatedPanel,
  AsyncState,
  Button,
  ConfirmDialog,
  HeaderPanel,
  Input,
  Modal,
  PageLayout,
  Select,
  Textarea,
} from '@/shared/ui';

type Filter = 'ALL' | 'PENDING' | 'ACCEPTED' | 'REALIZED';
type WishFormProps = {
  familyMembers: Array<{ id: string; user: { firstName: string; lastName: string } }>;
  initialValue?: FamilyWishResponseDto;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (values: { description: string; partnerId: string; title: string }) => Promise<void>;
};

const filters = [
  { label: 'Все желания', value: 'ALL' },
  { label: 'Ждут ответа', value: 'PENDING' },
  { label: 'Согласованные', value: 'ACCEPTED' },
  { label: 'Исполненные', value: 'REALIZED' },
];
const key = () =>
  `wish-${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now()}`;
const name = ({ firstName, lastName }: { firstName: string; lastName: string }) =>
  `${firstName} ${lastName}`.trim();
const description = (value: FamilyWishResponseDto['description']) =>
  typeof value === 'string' ? value : '';

const WishForm = ({
  familyMembers,
  initialValue,
  isSubmitting,
  onCancel,
  onSubmit,
}: WishFormProps) => {
  const [title, setTitle] = useState(initialValue?.title ?? '');
  const [details, setDetails] = useState(description(initialValue?.description));
  const [partnerId, setPartnerId] = useState(
    initialValue?.partner.id ?? familyMembers[0]?.id ?? '',
  );
  const [error, setError] = useState<string>();
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || (!initialValue && !partnerId)) return;
    setError(undefined);
    try {
      await onSubmit({ description: details.trim(), partnerId, title: title.trim() });
    } catch (cause) {
      setError(
        getApiErrorMessage(
          cause,
          initialValue ? 'Не удалось сохранить желание' : 'Не удалось добавить желание',
        ),
      );
    }
  };
  return (
    <form className="space-y-4" noValidate onSubmit={submit}>
      <div>
        <p className="text-neon-pink text-xs font-semibold uppercase tracking-[0.2em]">
          Наши желания
        </p>
        <h2 className="text-text mt-1 text-xl font-semibold">
          {initialValue ? 'Изменить желание' : 'Новое желание'}
        </h2>
      </div>
      <Input
        autoComplete="off"
        label="О чём мечтаете?"
        maxLength={160}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Например, увидеть северное сияние"
        required
        value={title}
      />
      {!initialValue && (
        <Select
          label="Кому предложить"
          onChange={setPartnerId}
          options={familyMembers.map(({ id, user }) => ({ label: name(user), value: id }))}
          value={partnerId}
        />
      )}
      <Textarea
        label="Детали"
        maxLength={5000}
        onChange={(event) => setDetails(event.target.value)}
        placeholder="Добавьте то, что поможет воплотить эту идею"
        rows={4}
        value={details}
      />
      {error && (
        <p className="text-neon-pink text-sm" role="alert">
          {error}
        </p>
      )}
      <div className="flex flex-wrap justify-end gap-gap">
        <Button disabled={isSubmitting} onClick={onCancel} type="button">
          Отмена
        </Button>
        <Button
          disabled={isSubmitting || !title.trim() || (!initialValue && !partnerId)}
          icon={initialValue ? <Check className="size-4" /> : <Plus className="size-4" />}
          isLoading={isSubmitting}
          type="submit"
        >
          {initialValue ? 'Сохранить' : 'Предложить желание'}
        </Button>
      </div>
    </form>
  );
};

export const WishesPage = () => {
  const [filter, setFilter] = useState<Filter>('ALL');
  const [page, setPage] = useState(1);
  const [formWish, setFormWish] = useState<FamilyWishResponseDto | null | undefined>();
  const [selectedId, setSelectedId] = useState<string>();
  const [deleteWish, setDeleteWish] = useState<FamilyWishResponseDto>();
  const [error, setError] = useState<string>();
  const family = useFindMyFamilyQuery();
  const currentUser = useFindCurrentUserQuery();
  const wishQuery = { limit: 12, page } as {
    implementationStatus?: 'REALIZED';
    limit: number;
    page: number;
    partnerApprovalStatus?: 'PENDING' | 'ACCEPTED';
  };
  if (filter === 'REALIZED') wishQuery.implementationStatus = 'REALIZED';
  if (filter === 'PENDING') wishQuery.partnerApprovalStatus = 'PENDING';
  if (filter === 'ACCEPTED') wishQuery.partnerApprovalStatus = 'ACCEPTED';
  const wishes = useList17Query(wishQuery);
  const selected = useFindOne3Query(selectedId ? { id: selectedId } : skipToken);
  const [createWish, createState] = useCreate16Mutation();
  const [updateWish, updateState] = useUpdate12Mutation();
  const [removeWish, removeState] = useRemove7Mutation();
  const [accept] = useAcceptMutation();
  const [reject] = useRejectMutation();
  const [markRealized] = useMarkRealizedMutation();
  const [confirmRealization] = useConfirmRealizationMutation();
  const [rejectRealization] = useRejectRealizationMutation();
  const members = useMemo(
    () =>
      (family.data?.members ?? []).filter(({ user }) => user.id !== currentUser.data?.id) as Array<{
        id: string;
        user: { firstName: string; lastName: string };
      }>,
    [currentUser.data?.id, family.data?.members],
  );
  const refresh = () => {
    wishes.refetch();
    if (selectedId) selected.refetch();
  };
  const execute = async (action: () => Promise<unknown>, fallback: string) => {
    setError(undefined);
    try {
      await action();
      refresh();
    } catch (cause) {
      setError(getApiErrorMessage(cause, fallback));
    }
  };
  const save = async (values: { description: string; partnerId: string; title: string }) => {
    if (formWish)
      await updateWish({
        'If-Match': String(formWish.version),
        id: formWish.id,
        updateFamilyWishDto: {
          description: values.description ? (values.description as unknown as object) : null,
          title: values.title,
        },
      }).unwrap();
    else
      await createWish({
        'Idempotency-Key': key(),
        createFamilyWishDto: {
          description: values.description ? (values.description as unknown as object) : null,
          partnerId: values.partnerId,
          title: values.title,
        },
      }).unwrap();
    setFormWish(undefined);
    refresh();
  };
  const active = selected.data;
  const creator = (wish: FamilyWishResponseDto) => wish.createdBy.id === currentUser.data?.id;
  const partner = (wish: FamilyWishResponseDto) => wish.partner.id === currentUser.data?.id;
  return (
    <PageLayout>
      <HeaderPanel
        left={
          <>
            <p className="text-neon-pink text-xs font-semibold uppercase tracking-[0.2em]">
              Развлечения
            </p>
            <h1 className="text-text mt-1 text-2xl font-semibold sm:text-3xl">Наши желания</h1>
            <p className="text-muted-text mt-1 text-sm">
              Предлагайте мечты друг другу, договаривайтесь и отмечайте то, что уже сбылось.
            </p>
          </>
        }
        right={
          <Button icon={<Plus className="size-4" />} onClick={() => setFormWish(null)}>
            Добавить желание
          </Button>
        }
      />
      <AnimatedPanel className="p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-gap">
          <div className="flex items-center gap-2">
            <HeartHandshake className="text-neon-pink size-5" />
            <h2 className="text-text font-semibold">Список желаний</h2>
            {wishes.data && <span className="text-muted-text text-sm">{wishes.data.total}</span>}
          </div>
          <Select
            label="Фильтр"
            onChange={(value) => {
              setFilter(value as Filter);
              setPage(1);
            }}
            options={filters}
            value={filter}
          />
        </div>
        {error && (
          <p className="text-neon-pink mt-4 text-sm" role="alert">
            {error}
          </p>
        )}
        <AsyncState
          empty={
            <p className="text-muted-text mt-5 text-sm">
              Здесь пока нет желаний. Начните с одной идеи для вас двоих.
            </p>
          }
          error={wishes.error}
          errorMessage="Не удалось загрузить желания"
          hasData={(wishes.data?.data ?? []).length > 0}
          isLoading={wishes.isLoading}
          onRetry={() => wishes.refetch()}
        >
          <div className="mt-5 grid gap-gap md:grid-cols-2 xl:grid-cols-3">
            {(wishes.data?.data ?? []).map((wish) => (
              <button
                className="border-border bg-elevated/55 hover:border-primary-neon/65 hover:shadow-[0_0_26px_color-mix(in_srgb,var(--color-primary-neon)_18%,transparent)] group min-h-48 rounded-2xl border p-5 text-left transition"
                key={wish.id}
                onClick={() => setSelectedId(wish.id)}
                type="button"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-neon-pink grid size-10 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--color-neon-pink)_12%,transparent)]">
                    {wish.implementationStatus === 'REALIZED' ? (
                      <CircleCheck className="size-5" />
                    ) : (
                      <Sparkles className="size-5" />
                    )}
                  </span>
                  {/* eslint-disable-next-line no-use-before-define */}
                  <WishStatus wish={wish} />
                </div>
                <h3 className="text-text mt-5 line-clamp-2 text-lg font-semibold">{wish.title}</h3>
                {description(wish.description) && (
                  <p className="text-muted-text mt-2 line-clamp-3 text-sm leading-relaxed">
                    {description(wish.description)}
                  </p>
                )}
                <p className="text-muted-text mt-5 text-xs">
                  От {name(wish.createdBy)} · для {name(wish.partner)}
                </p>
              </button>
            ))}
          </div>
        </AsyncState>
        {(wishes.data?.totalPages ?? 1) > 1 && (
          <div className="mt-5 flex items-center justify-end gap-gap">
            <Button
              disabled={page <= 1}
              icon={<ChevronLeft className="size-4" />}
              onClick={() => setPage((value) => value - 1)}
            />
            <span className="text-muted-text text-sm">
              {page} / {wishes.data?.totalPages}
            </span>
            <Button
              disabled={page >= (wishes.data?.totalPages ?? 1)}
              icon={<ChevronRight className="size-4" />}
              onClick={() => setPage((value) => value + 1)}
            />
          </div>
        )}
      </AnimatedPanel>
      <Modal
        ariaLabel="Форма желания"
        contentClassName="max-w-xl p-5 sm:p-6"
        onClose={() => setFormWish(undefined)}
        open={formWish !== undefined}
      >
        <WishForm
          familyMembers={members}
          initialValue={formWish ?? undefined}
          isSubmitting={createState.isLoading || updateState.isLoading}
          onCancel={() => setFormWish(undefined)}
          onSubmit={save}
        />
      </Modal>
      <Modal
        ariaLabel="Детали желания"
        contentClassName="max-w-xl p-5 sm:p-6"
        onClose={() => setSelectedId(undefined)}
        open={Boolean(selectedId)}
      >
        {active ? (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-gap">
              <div>
                <p className="text-neon-pink text-xs font-semibold uppercase tracking-[0.2em]">
                  Наше желание
                </p>
                <h2 className="text-text mt-1 text-xl font-semibold">{active.title}</h2>
              </div>
              {/* eslint-disable-next-line no-use-before-define */}
              <WishStatus wish={active} />
            </div>
            {description(active.description) && (
              <p className="text-muted-text whitespace-pre-wrap text-sm leading-relaxed">
                {description(active.description)}
              </p>
            )}
            <div className="border-border bg-elevated/50 grid gap-3 rounded-2xl border p-4 text-sm sm:grid-cols-2">
              <p>
                <span className="text-muted-text">Предложил:</span> {name(active.createdBy)}
              </p>
              <p>
                <span className="text-muted-text">Партнёр:</span> {name(active.partner)}
              </p>
              {active.realizedBy && (
                <p>
                  <span className="text-muted-text">Исполнил:</span> {name(active.realizedBy)}
                </p>
              )}
            </div>
            {/* eslint-disable-next-line no-use-before-define */}
            <WishActions
              creator={creator(active)}
              partner={partner(active)}
              onAccept={() =>
                execute(
                  () => accept({ 'Idempotency-Key': key(), id: active.id }).unwrap(),
                  'Не удалось принять желание',
                )
              }
              onConfirm={() =>
                execute(
                  () => confirmRealization({ 'Idempotency-Key': key(), id: active.id }).unwrap(),
                  'Не удалось подтвердить исполнение',
                )
              }
              onEdit={() => setFormWish(active)}
              onMark={() =>
                execute(
                  () => markRealized({ 'Idempotency-Key': key(), id: active.id }).unwrap(),
                  'Не удалось отметить исполнение',
                )
              }
              onReject={() =>
                execute(
                  () => reject({ 'Idempotency-Key': key(), id: active.id }).unwrap(),
                  'Не удалось отклонить желание',
                )
              }
              onRejectRealization={() =>
                execute(
                  () => rejectRealization({ 'Idempotency-Key': key(), id: active.id }).unwrap(),
                  'Не удалось отклонить исполнение',
                )
              }
              onRemove={() => setDeleteWish(active)}
              wish={active}
            />
          </div>
        ) : (
          <p className="text-muted-text py-8 text-center text-sm">Загрузка желания…</p>
        )}
      </Modal>
      <ConfirmDialog
        confirmLabel="Удалить"
        description={`Желание «${deleteWish?.title ?? ''}» будет удалено без возможности восстановления.`}
        isLoading={removeState.isLoading}
        onCancel={() => setDeleteWish(undefined)}
        onConfirm={() => {
          if (deleteWish)
            execute(async () => {
              await removeWish({ id: deleteWish.id }).unwrap();
              setDeleteWish(undefined);
              setSelectedId(undefined);
            }, 'Не удалось удалить желание').catch(() => undefined);
        }}
        open={Boolean(deleteWish)}
        title="Удалить желание?"
      />
    </PageLayout>
  );
};

const WishStatus = ({ wish }: { wish: FamilyWishResponseDto }) => {
  let label = 'Согласовано';
  if (wish.partnerApprovalStatus === 'REJECTED') label = 'Отклонено';
  if (wish.partnerApprovalStatus === 'PENDING') label = 'Ждёт ответа';
  if (wish.realizationConfirmationStatus === 'PENDING') label = 'Ждёт подтверждения';
  if (wish.implementationStatus === 'REALIZED') label = 'Исполнено';
  return (
    <span className="text-muted-text inline-flex items-center gap-1.5 text-xs">
      <Clock3 className="size-3.5" />
      {label}
    </span>
  );
};

type WishActionsProps = {
  creator: boolean;
  partner: boolean;
  onAccept: () => void;
  onConfirm: () => void;
  onEdit: () => void;
  onMark: () => void;
  onReject: () => void;
  onRejectRealization: () => void;
  onRemove: () => void;
  wish: FamilyWishResponseDto;
};
const WishActions = ({
  creator,
  partner,
  onAccept,
  onConfirm,
  onEdit,
  onMark,
  onReject,
  onRejectRealization,
  onRemove,
  wish,
}: WishActionsProps) => (
  <div className="flex flex-wrap justify-end gap-gap border-t border-border pt-4">
    {partner && wish.partnerApprovalStatus === 'PENDING' && (
      <>
        <Button icon={<Check className="size-4" />} onClick={onAccept}>
          Принять
        </Button>
        <Button icon={<X className="size-4" />} onClick={onReject}>
          Отклонить
        </Button>
      </>
    )}
    {creator &&
      wish.partnerApprovalStatus === 'ACCEPTED' &&
      wish.implementationStatus === 'NOT_REALIZED' && (
        <Button icon={<CircleCheck className="size-4" />} onClick={onMark}>
          Отметить исполненным
        </Button>
      )}
    {partner && wish.realizationConfirmationStatus === 'PENDING' && (
      <>
        <Button icon={<Check className="size-4" />} onClick={onConfirm}>
          Подтвердить
        </Button>
        <Button icon={<X className="size-4" />} onClick={onRejectRealization}>
          Отклонить
        </Button>
      </>
    )}
    {creator && wish.implementationStatus === 'NOT_REALIZED' && (
      <Button icon={<Pencil className="size-4" />} onClick={onEdit}>
        Изменить
      </Button>
    )}
    {creator && (
      <Button icon={<Trash2 className="size-4" />} onClick={onRemove}>
        Удалить
      </Button>
    )}
  </div>
);
