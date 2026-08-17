import { Plus } from 'lucide-react';
import { useState } from 'react';
import {
  useCompleteFinancialMeetingMutation,
  useCreateFinancialDecisionMutation,
  useCreateFinancialMeetingMutation,
  useListFinancialMeetingsQuery,
  useRespondFinancialDecisionMutation,
} from '@/entities/finance';
import { getApiErrorMessage } from '@/shared/api';
import { AnimatedPanel, AsyncState, Button, DatePicker, Input } from '@/shared/ui';

export const MeetingsTab = () => {
  const query = useListFinancialMeetingsQuery();
  const [create, createState] = useCreateFinancialMeetingMutation();
  const [complete] = useCompleteFinancialMeetingMutation();
  const [createDecision] = useCreateFinancialDecisionMutation();
  const [respond] = useRespondFinancialDecisionMutation();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [decisionTitle, setDecisionTitle] = useState('');
  const [meetingId, setMeetingId] = useState('');
  const [error, setError] = useState<string>();
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !date) return;
    try {
      await create({ title: title.trim(), scheduledAt: new Date(date).toISOString() }).unwrap();
      setTitle('');
      setDate('');
    } catch (e) {
      setError(getApiErrorMessage(e, 'Не удалось создать встречу'));
    }
  };
  const submitDecision = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!meetingId || !decisionTitle.trim()) return;
    try {
      await createDecision({ meetingId, title: decisionTitle.trim() }).unwrap();
      setMeetingId('');
      setDecisionTitle('');
    } catch (e) {
      setError(getApiErrorMessage(e, 'Не удалось добавить решение'));
    }
  };
  return (
    <AsyncState
      error={query.error}
      errorMessage="Не удалось загрузить финансовые встречи"
      hasData={Boolean(query.data)}
      isLoading={query.isLoading}
      onRetry={query.refetch}
    >
      <AnimatedPanel className="p-5">
        <h2 className="text-text mb-3 text-lg font-semibold">Финансовые встречи</h2>
        <div className="mb-3 grid gap-2">
          {(query.data ?? []).map((meeting) => (
            <div className="bg-surface rounded-panel p-3" key={meeting.id}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-text truncate">{meeting.title}</div>
                  <div className="text-muted-text text-sm">
                    {new Date(meeting.scheduledAt).toLocaleString('ru-RU')} · {meeting.status}
                  </div>
                </div>
                {meeting.status !== 'COMPLETED' && (
                  <Button
                    onClick={() => complete({ id: meeting.id, version: meeting.version })}
                    size="s"
                  >
                    Завершить
                  </Button>
                )}
              </div>
              <div className="mt-2 grid gap-2">
                {meeting.decisions.map((decision) => (
                  <div
                    className="border-border flex items-center justify-between gap-2 rounded-panel border p-2"
                    key={decision.id}
                  >
                    <span className="text-text truncate text-sm">
                      {decision.title} · {decision.status}
                    </span>
                    {decision.status === 'PENDING' && (
                      <span className="flex gap-1">
                        <Button
                          onClick={() =>
                            respond({
                              meetingId: meeting.id,
                              decisionId: decision.id,
                              status: 'AGREED',
                              version: decision.version,
                            })
                          }
                          size="s"
                        >
                          Согласовать
                        </Button>
                        <Button
                          onClick={() =>
                            respond({
                              meetingId: meeting.id,
                              decisionId: decision.id,
                              status: 'REJECTED',
                              version: decision.version,
                            })
                          }
                          size="s"
                        >
                          Отклонить
                        </Button>
                      </span>
                    )}
                  </div>
                ))}
              </div>
              {meetingId === meeting.id ? (
                <form className="mt-2 flex items-end gap-2" onSubmit={submitDecision}>
                  <Input
                    label=""
                    onChange={(event) => setDecisionTitle(event.target.value)}
                    placeholder="Новое решение"
                    value={decisionTitle}
                  />
                  <Button size="s" type="submit">
                    Сохранить
                  </Button>
                </form>
              ) : (
                <Button className="mt-2" onClick={() => setMeetingId(meeting.id)} size="s">
                  Добавить решение
                </Button>
              )}
            </div>
          ))}
        </div>
        <form className="grid items-end gap-2 sm:grid-cols-[1fr_1fr_auto]" onSubmit={submit}>
          <Input
            label="Название"
            onChange={(event) => setTitle(event.target.value)}
            placeholder="План бюджета"
            value={title}
          />
          <DatePicker
            id="meeting-date"
            label="Дата встречи"
            onChange={(event) => setDate(event.target.value)}
            value={date}
            withTime
          />
          <Button
            disabled={createState.isLoading}
            icon={<Plus className="size-4" />}
            size="s"
            type="submit"
          >
            Добавить
          </Button>
        </form>
        {error && <p className="text-neon-pink mt-2 text-sm">{error}</p>}
      </AnimatedPanel>
    </AsyncState>
  );
};
