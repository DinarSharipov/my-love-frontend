import { HeartPulse, MessageCircleHeart, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import {
  useGrantWellbeingConsentMutation,
  useCreateWellbeingCheckInMutation,
  useListWellbeingConsentsQuery,
  useListSharedWellbeingCheckInsQuery,
  useListWellbeingCheckInsQuery,
  useRevokeWellbeingConsentMutation,
} from '@/entities/wellbeing';
import { useFindMyFamilyQuery } from '@/shared/api';
import { AnimatedPanel, AsyncState, Button, Select, Textarea } from '@/shared/ui';

const scoreOptions = [1, 2, 3, 4, 5].map((value) => ({
  value: String(value),
  label: `${value}/5`,
}));
type CheckIn = {
  id: string;
  mood: number;
  energy: number;
  stress: number;
  createdAt: string;
  note?: string | null;
};

type CheckInValues = {
  mood: number;
  energy: number;
  stress: number;
  note?: string;
  supportRequest: boolean;
};
const CheckInForm = ({
  isLoading,
  onSubmit,
}: {
  isLoading: boolean;
  onSubmit: (event: FormEvent, values: CheckInValues) => void;
}) => {
  const [mood, setMood] = useState('3');
  const [energy, setEnergy] = useState('3');
  const [stress, setStress] = useState('3');
  const [note, setNote] = useState('');
  const [supportRequest, setSupportRequest] = useState(false);
  return (
    <form
      className="space-y-4"
      onSubmit={(event) =>
        onSubmit(event, {
          mood: Number(mood),
          energy: Number(energy),
          stress: Number(stress),
          note: note.trim() || undefined,
          supportRequest,
        })
      }
    >
      <div className="grid gap-gap sm:grid-cols-3">
        <Select label="Настроение" onChange={setMood} options={scoreOptions} value={mood} />
        <Select label="Энергия" onChange={setEnergy} options={scoreOptions} value={energy} />
        <Select label="Стресс" onChange={setStress} options={scoreOptions} value={stress} />
      </div>
      <Textarea label="Заметка" onChange={(event) => setNote(event.target.value)} value={note} />
      <label
        className="text-muted-text flex items-center gap-2 text-sm"
        htmlFor="wellbeing-support-request"
      >
        <input
          checked={supportRequest}
          id="wellbeing-support-request"
          onChange={(event) => setSupportRequest(event.target.checked)}
          type="checkbox"
        />
        Нужна поддержка партнёра
      </label>
      <Button disabled={isLoading} type="submit">
        Сохранить состояние
      </Button>
    </form>
  );
};

const CheckInList = ({
  items,
  title,
  icon,
  empty,
  error,
  isLoading,
  onRetry,
  showNote = false,
}: {
  items: CheckIn[];
  title: string;
  icon: ReactNode;
  empty: string;
  error: unknown;
  isLoading: boolean;
  onRetry: () => void;
  showNote?: boolean;
}) => (
  <AnimatedPanel className="p-5">
    <h2 className="text-text mb-4 flex items-center gap-2 font-semibold">
      {icon}
      {title}
    </h2>
    <AsyncState
      error={error}
      hasData={Boolean(items.length)}
      isLoading={isLoading}
      loading={<p className="text-muted-text text-sm">Загрузка…</p>}
      onRetry={onRetry}
    >
      <div className="space-y-2">
        {items.slice(0, 8).map((item) => (
          <div className="border-border bg-elevated/30 rounded-xl border p-3" key={item.id}>
            <div className="text-text text-sm">
              Настроение {item.mood}/5 · энергия {item.energy}/5 · стресс {item.stress}/5
            </div>
            <div className="text-muted-text mt-1 text-xs">
              {new Date(item.createdAt).toLocaleString('ru-RU')}
              {showNote && item.note ? ` · ${item.note}` : ''}
            </div>
          </div>
        ))}
        {!items.length && <p className="text-muted-text text-sm">{empty}</p>}
      </div>
    </AsyncState>
  </AnimatedPanel>
);

export const WellbeingPanel = () => {
  const own = useListWellbeingCheckInsQuery();
  const shared = useListSharedWellbeingCheckInsQuery();
  const [create, state] = useCreateWellbeingCheckInMutation();
  const family = useFindMyFamilyQuery();
  const consents = useListWellbeingConsentsQuery();
  const [grantConsent, grantState] = useGrantWellbeingConsentMutation();
  const [revokeConsent] = useRevokeWellbeingConsentMutation();
  const [recipientId, setRecipientId] = useState('');
  const [error, setError] = useState('');
  const [formKey, setFormKey] = useState(0);
  const submit = async (event: FormEvent, values: CheckInValues) => {
    event.preventDefault();
    setError('');
    try {
      await create(values).unwrap();
      setFormKey((value) => value + 1);
      own.refetch();
    } catch {
      setError('Не удалось сохранить отметку состояния');
    }
  };
  return (
    <div className="space-y-gap">
      <AnimatedPanel className="p-5 sm:p-6">
        <div className="mb-4 flex items-start gap-gap">
          <ShieldCheck className="text-acid-green mt-1 h-6 w-6" />
          <div>
            <h2 className="text-text font-semibold">Кто видит wellbeing-данные</h2>
            <p className="text-muted-text mt-1 text-sm">
              По умолчанию check-in виден только вам. Доступ выдаётся отдельно и может быть отозван.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-gap sm:flex-row sm:items-end">
          <Select
            label="Разрешить партнёру"
            onChange={setRecipientId}
            options={(family.data?.members ?? []).map(({ user }) => ({
              value: user.id,
              label: `${user.firstName} ${user.lastName}`,
            }))}
            value={recipientId}
          />
          <Button
            disabled={!recipientId || grantState.isLoading}
            onClick={async () => {
              await grantConsent({
                recipientId,
                scopes: ['mood', 'energy', 'stress', 'supportRequest'],
              }).unwrap();
              consents.refetch();
            }}
          >
            Выдать доступ
          </Button>
        </div>
        <div className="mt-4 space-y-2">
          {(consents.data ?? []).map((consent) => (
            <div
              className="border-border flex items-center justify-between gap-3 rounded-xl border p-3"
              key={consent.id}
            >
              <span className="text-muted-text text-sm">
                Доступ выдан · {consent.scopes.join(', ')}
              </span>
              <Button
                className="text-neon-pink"
                onClick={async () => {
                  await revokeConsent(consent.id).unwrap();
                  consents.refetch();
                }}
                size="s"
              >
                Отозвать
              </Button>
            </div>
          ))}
        </div>
      </AnimatedPanel>
      <AnimatedPanel className="p-5 sm:p-6">
        <div className="mb-5 flex items-start gap-gap">
          <HeartPulse className="text-primary-neon mt-1 h-6 w-6" />
          <div>
            <h2 className="text-text font-semibold">Как вы сегодня?</h2>
            <p className="text-muted-text mt-1 text-sm">
              Личная отметка видна только вам, пока вы не дадите согласие.
            </p>
          </div>
        </div>
        <CheckInForm isLoading={state.isLoading} key={formKey} onSubmit={submit} />
        {error && (
          <p className="text-neon-pink mt-3 text-sm" role="alert">
            {error}
          </p>
        )}
      </AnimatedPanel>
      <div className="grid gap-gap lg:grid-cols-2">
        <CheckInList
          empty="Пока нет отметок."
          error={own.error}
          icon={<ShieldCheck className="text-acid-green h-5 w-5" />}
          isLoading={own.isLoading}
          items={own.data ?? []}
          onRetry={own.refetch}
          showNote
          title="Мои отметки"
        />
        <CheckInList
          empty="Партнёр ещё ничего не открыл."
          error={shared.error}
          icon={<MessageCircleHeart className="text-cyber-cyan h-5 w-5" />}
          isLoading={shared.isLoading}
          items={shared.data ?? []}
          onRetry={shared.refetch}
          title="Доступно мне"
        />
      </div>
    </div>
  );
};
