import {
  CalendarHeart,
  Check,
  ClipboardPenLine,
  HeartHandshake,
  Pause,
  Play,
  Plus,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';

import {
  useCreateWellbeingCoupleMeetingMutation,
  useCreateWellbeingRitualMutation,
  useDeleteWellbeingRitualMutation,
  useListWellbeingCoupleMeetingsQuery,
  useListWellbeingRitualsQuery,
  usePublishWellbeingCoupleMeetingMutation,
  useRespondToWellbeingCoupleMeetingMutation,
  useSetWellbeingCoupleMeetingDecisionMutation,
  useUpdateWellbeingRitualMutation,
} from '@/entities/wellbeing';
import { useFindCurrentUserQuery, getApiErrorMessage } from '@/shared/api';
import { AnimatedPanel, AsyncState, Button, DatePicker, Input, Textarea } from '@/shared/ui';

const localDateTime = (daysFromNow: number) => {
  const date = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);
  date.setMinutes(0, 0, 0);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000).toISOString().slice(0, 16);
};

const toIso = (value: string) => new Date(value).toISOString();

export const WellbeingRitualsMeetingsPanel = () => {
  const currentUser = useFindCurrentUserQuery();
  const rituals = useListWellbeingRitualsQuery();
  const meetings = useListWellbeingCoupleMeetingsQuery();
  const [createRitual, createRitualState] = useCreateWellbeingRitualMutation();
  const [updateRitual] = useUpdateWellbeingRitualMutation();
  const [deleteRitual] = useDeleteWellbeingRitualMutation();
  const [createMeeting, createMeetingState] = useCreateWellbeingCoupleMeetingMutation();
  const [respondToMeeting, responseState] = useRespondToWellbeingCoupleMeetingMutation();
  const [publishMeeting, publishState] = usePublishWellbeingCoupleMeetingMutation();
  const [setDecision, decisionState] = useSetWellbeingCoupleMeetingDecisionMutation();

  const [ritualTitle, setRitualTitle] = useState('');
  const [ritualDescription, setRitualDescription] = useState('');
  const [ritualCadence, setRitualCadence] = useState('WEEKLY');
  const [ritualNextAt, setRitualNextAt] = useState(localDateTime(1));
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingScheduledAt, setMeetingScheduledAt] = useState(localDateTime(2));
  const [meetingSections, setMeetingSections] = useState('Что получилось хорошо?\nЧто обсудить?');
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [decisions, setDecisions] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>();

  const refresh = () => {
    rituals.refetch();
    meetings.refetch();
  };

  const submitRitual = async (event: FormEvent) => {
    event.preventDefault();
    if (!ritualTitle.trim() || !ritualNextAt) return;
    setError(undefined);
    try {
      await createRitual({
        title: ritualTitle.trim(),
        description: ritualDescription.trim() || undefined,
        cadence: ritualCadence.trim() || 'WEEKLY',
        nextAt: toIso(ritualNextAt),
      }).unwrap();
      setRitualTitle('');
      setRitualDescription('');
      refresh();
    } catch (cause) {
      setError(getApiErrorMessage(cause, 'Не удалось создать ритуал'));
    }
  };

  const submitMeeting = async (event: FormEvent) => {
    event.preventDefault();
    const sections = meetingSections
      .split('\n')
      .map((section) => section.trim())
      .filter(Boolean);
    if (!meetingTitle.trim() || !meetingScheduledAt || sections.length === 0) return;
    setError(undefined);
    try {
      await createMeeting({
        title: meetingTitle.trim(),
        scheduledAt: toIso(meetingScheduledAt),
        sections,
      }).unwrap();
      setMeetingTitle('');
      refresh();
    } catch (cause) {
      setError(getApiErrorMessage(cause, 'Не удалось запланировать встречу'));
    }
  };

  const run = async (action: () => Promise<unknown>, fallback: string) => {
    setError(undefined);
    try {
      await action();
      refresh();
    } catch (cause) {
      setError(getApiErrorMessage(cause, fallback));
    }
  };

  return (
    <div className="space-y-gap">
      <AnimatedPanel className="p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <HeartHandshake aria-hidden="true" className="text-primary-neon mt-1 size-6" />
          <div>
            <h2 className="text-text text-lg font-semibold">Ритуалы и разговоры</h2>
            <p className="text-muted-text mt-1 text-sm">
              Небольшие регулярные действия и безопасные встречи для двоих.
            </p>
          </div>
        </div>
        {error && (
          <p className="text-neon-pink mt-4 text-sm" role="alert">
            {error}
          </p>
        )}
        <div className="mt-4 grid gap-gap lg:grid-cols-2">
          <form
            className="border-border bg-elevated/25 rounded-2xl border p-4"
            onSubmit={submitRitual}
          >
            <h3 className="text-text flex items-center gap-2 font-semibold">
              <CalendarHeart aria-hidden="true" className="text-cyber-cyan size-4" />
              Новый ритуал
            </h3>
            <div className="mt-3 space-y-3">
              <Input
                label="Название"
                maxLength={200}
                onChange={(event) => setRitualTitle(event.target.value)}
                value={ritualTitle}
              />
              <Textarea
                label="Описание"
                maxLength={2000}
                onChange={(event) => setRitualDescription(event.target.value)}
                value={ritualDescription}
              />
              <div className="grid gap-gap sm:grid-cols-2">
                <Input
                  label="Периодичность"
                  maxLength={50}
                  onChange={(event) => setRitualCadence(event.target.value)}
                  value={ritualCadence}
                />
                <DatePicker
                  label="Следующий раз"
                  onChange={(event) => setRitualNextAt(event.target.value)}
                  value={ritualNextAt}
                  withTime
                />
              </div>
              <Button disabled={createRitualState.isLoading || !ritualTitle.trim()} type="submit">
                <Plus aria-hidden="true" className="size-4" />
                Добавить ритуал
              </Button>
            </div>
          </form>

          <div>
            <AsyncState
              empty={
                !rituals.isLoading ? (
                  <p className="text-muted-text text-sm">Ритуалов пока нет.</p>
                ) : undefined
              }
              error={rituals.error}
              hasData={Boolean(rituals.data)}
              isLoading={rituals.isLoading}
              onRetry={rituals.refetch}
            >
              <div className="space-y-2">
                {(rituals.data ?? []).map((ritual) => (
                  <div className="border-border rounded-xl border p-3" key={ritual.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-text truncate font-semibold">{ritual.title}</p>
                        <p className="text-muted-text mt-1 text-xs">
                          {ritual.cadence} · {new Date(ritual.nextAt).toLocaleString('ru-RU')}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button
                          aria-label={ritual.isActive ? 'Поставить на паузу' : 'Возобновить ритуал'}
                          onClick={() =>
                            run(
                              () =>
                                updateRitual({
                                  id: ritual.id,
                                  isActive: !ritual.isActive,
                                }).unwrap(),
                              'Не удалось изменить ритуал',
                            )
                          }
                          size="s"
                        >
                          {ritual.isActive ? (
                            <Pause aria-hidden="true" className="size-4" />
                          ) : (
                            <Play aria-hidden="true" className="size-4" />
                          )}
                        </Button>
                        <Button
                          aria-label="Удалить ритуал"
                          onClick={() =>
                            run(() => deleteRitual(ritual.id).unwrap(), 'Не удалось удалить ритуал')
                          }
                          size="s"
                        >
                          <Trash2 aria-hidden="true" className="size-4" />
                        </Button>
                      </div>
                    </div>
                    {ritual.description && (
                      <p className="text-muted-text mt-2 text-sm">{ritual.description}</p>
                    )}
                    <span
                      className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs ${ritual.isActive ? 'bg-acid-green/10 text-acid-green' : 'bg-elevated text-muted-text'}`}
                    >
                      {ritual.isActive ? 'Активен' : 'Пауза'}
                    </span>
                  </div>
                ))}
              </div>
            </AsyncState>
          </div>
        </div>
      </AnimatedPanel>

      <AnimatedPanel className="p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <ClipboardPenLine aria-hidden="true" className="text-cyber-cyan mt-1 size-6" />
          <div>
            <h2 className="text-text text-lg font-semibold">Парная встреча</h2>
            <p className="text-muted-text mt-1 text-sm">
              Создайте будущую встречу, ответьте на вопросы и зафиксируйте общее решение.
            </p>
          </div>
        </div>
        <form
          className="border-border bg-elevated/25 mt-4 rounded-2xl border p-4"
          onSubmit={submitMeeting}
        >
          <div className="grid gap-gap lg:grid-cols-[1fr_1fr]">
            <Input
              label="Название"
              maxLength={200}
              onChange={(event) => setMeetingTitle(event.target.value)}
              value={meetingTitle}
            />
            <DatePicker
              label="Дата встречи"
              onChange={(event) => setMeetingScheduledAt(event.target.value)}
              value={meetingScheduledAt}
              withTime
            />
          </div>
          <Textarea
            className="mt-3"
            hint="Каждая строка — отдельный вопрос или тема."
            label="Темы встречи"
            maxLength={5000}
            onChange={(event) => setMeetingSections(event.target.value)}
            value={meetingSections}
          />
          <Button
            className="mt-3"
            disabled={createMeetingState.isLoading || !meetingTitle.trim()}
            type="submit"
          >
            <Plus aria-hidden="true" className="size-4" />
            Запланировать встречу
          </Button>
        </form>

        <AsyncState
          empty={
            !meetings.isLoading ? (
              <p className="text-muted-text mt-4 text-sm">Запланированных встреч пока нет.</p>
            ) : undefined
          }
          error={meetings.error}
          hasData={Boolean(meetings.data)}
          isLoading={meetings.isLoading}
          onRetry={meetings.refetch}
        >
          <div className="mt-4 grid gap-gap lg:grid-cols-2">
            {(meetings.data ?? []).map((meeting) => {
              const isCreator = meeting.createdById === currentUser.data?.id;
              const response = responses[meeting.id] ?? '';
              const decision = decisions[meeting.id] ?? meeting.sharedDecision ?? '';
              return (
                <div className="border-border rounded-2xl border p-4" key={meeting.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-text font-semibold">{meeting.title}</h3>
                      <p className="text-muted-text mt-1 text-xs">
                        {new Date(meeting.scheduledAt).toLocaleString('ru-RU')}
                      </p>
                    </div>
                    {meeting.publishedAt ? (
                      <span className="bg-acid-green/10 text-acid-green rounded-full px-2 py-1 text-xs">
                        Опубликовано
                      </span>
                    ) : (
                      <span className="bg-primary-neon/10 text-primary-neon rounded-full px-2 py-1 text-xs">
                        Черновик
                      </span>
                    )}
                  </div>
                  <ul className="text-muted-text mt-3 space-y-1 text-sm">
                    {meeting.sections.map((section) => (
                      <li key={section}>• {section}</li>
                    ))}
                  </ul>
                  <Textarea
                    className="mt-3"
                    disabled={Boolean(meeting.publishedAt) || responseState.isLoading}
                    label="Ваш ответ"
                    maxLength={5000}
                    onChange={(event) =>
                      setResponses((current) => ({ ...current, [meeting.id]: event.target.value }))
                    }
                    value={response}
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      disabled={
                        Boolean(meeting.publishedAt) || responseState.isLoading || !response.trim()
                      }
                      onClick={() =>
                        run(
                          () =>
                            respondToMeeting({
                              id: meeting.id,
                              response: response.trim(),
                            }).unwrap(),
                          'Не удалось сохранить ответ',
                        )
                      }
                      size="s"
                    >
                      <Check aria-hidden="true" className="size-4" />
                      Сохранить ответ
                    </Button>
                    {isCreator && !meeting.publishedAt && (
                      <Button
                        disabled={publishState.isLoading}
                        onClick={() =>
                          run(
                            () => publishMeeting(meeting.id).unwrap(),
                            'Не удалось опубликовать встречу',
                          )
                        }
                        size="s"
                      >
                        Опубликовать ответы
                      </Button>
                    )}
                  </div>
                  {meeting.publishedAt && (
                    <>
                      <Textarea
                        className="mt-3"
                        disabled={decisionState.isLoading}
                        label="Общее решение"
                        maxLength={5000}
                        onChange={(event) =>
                          setDecisions((current) => ({
                            ...current,
                            [meeting.id]: event.target.value,
                          }))
                        }
                        value={decision}
                      />
                      <Button
                        className="mt-3"
                        disabled={decisionState.isLoading || !decision.trim()}
                        onClick={() =>
                          run(
                            () =>
                              setDecision({ id: meeting.id, decision: decision.trim() }).unwrap(),
                            'Не удалось сохранить решение',
                          )
                        }
                        size="s"
                      >
                        Сохранить решение
                      </Button>
                    </>
                  )}
                  <p className="text-muted-text mt-3 text-xs">
                    Ответов: {Object.keys(meeting.responses ?? {}).length}
                  </p>
                </div>
              );
            })}
          </div>
        </AsyncState>
      </AnimatedPanel>
    </div>
  );
};
