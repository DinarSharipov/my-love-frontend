import { Download, HeartHandshake, MessageCircleHeart, ShieldCheck, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';

import {
  useCreateWellbeingAssessmentMutation,
  useCreateWellbeingGratitudeMutation,
  useCreateWellbeingSupportRequestMutation,
  useGetWellbeingTrendsQuery,
  useLazyExportWellbeingDataQuery,
  useListWellbeingAssessmentsQuery,
  useListWellbeingGratitudesQuery,
  useListWellbeingSupportRequestsQuery,
  useDeleteWellbeingGratitudeMutation,
  useUpdateWellbeingSupportRequestMutation,
} from '@/entities/wellbeing';
import { useFindMyFamilyQuery, getApiErrorMessage } from '@/shared/api';
import { AnimatedPanel, AsyncState, Button, Select, Textarea } from '@/shared/ui';

const scoreOptions = Array.from({ length: 6 }, (_, value) => ({
  label: `${value}/5`,
  value: String(value),
}));

export const WellbeingAdvancedPanel = () => {
  const family = useFindMyFamilyQuery();
  const assessments = useListWellbeingAssessmentsQuery();
  const trends = useGetWellbeingTrendsQuery();
  const gratitudes = useListWellbeingGratitudesQuery();
  const supportRequests = useListWellbeingSupportRequestsQuery();
  const [exportData, exportState] = useLazyExportWellbeingDataQuery();
  const [createAssessment, assessmentState] = useCreateWellbeingAssessmentMutation();
  const [createGratitude, gratitudeState] = useCreateWellbeingGratitudeMutation();
  const [deleteGratitude] = useDeleteWellbeingGratitudeMutation();
  const [createSupportRequest, supportState] = useCreateWellbeingSupportRequestMutation();
  const [updateSupportRequest] = useUpdateWellbeingSupportRequestMutation();
  const [answers, setAnswers] = useState(['3', '3', '3', '3', '3']);
  const [recipientId, setRecipientId] = useState('');
  const [gratitudeMessage, setGratitudeMessage] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [error, setError] = useState<string>();

  const members = useMemo(
    () =>
      (family.data?.members ?? []).map(({ user }) => ({
        label: `${user.firstName} ${user.lastName}`,
        value: user.id,
      })),
    [family.data?.members],
  );

  const refresh = () => {
    assessments.refetch();
    gratitudes.refetch();
    supportRequests.refetch();
  };

  const submitAssessment = async (event: FormEvent) => {
    event.preventDefault();
    setError(undefined);
    try {
      await createAssessment({ answers: answers.map(Number) }).unwrap();
      await assessments.refetch();
    } catch (cause) {
      setError(getApiErrorMessage(cause, 'Не удалось сохранить оценку состояния'));
    }
  };

  const submitGratitude = async (event: FormEvent) => {
    event.preventDefault();
    if (!recipientId || !gratitudeMessage.trim()) return;
    setError(undefined);
    try {
      await createGratitude({ recipientId, message: gratitudeMessage.trim() }).unwrap();
      setGratitudeMessage('');
      await gratitudes.refetch();
    } catch (cause) {
      setError(getApiErrorMessage(cause, 'Не удалось отправить благодарность'));
    }
  };

  const submitSupportRequest = async (event: FormEvent) => {
    event.preventDefault();
    if (!recipientId) return;
    setError(undefined);
    try {
      await createSupportRequest({
        recipientId,
        message: supportMessage.trim() || undefined,
      }).unwrap();
      setSupportMessage('');
      await supportRequests.refetch();
    } catch (cause) {
      setError(getApiErrorMessage(cause, 'Не удалось отправить запрос поддержки'));
    }
  };

  return (
    <div className="space-y-gap">
      <AnimatedPanel className="p-5 sm:p-6">
        <div className="mb-4 flex items-start gap-3">
          <ShieldCheck aria-hidden="true" className="text-acid-green mt-1 size-6" />
          <div>
            <h2 className="text-text text-lg font-semibold">Расширенный wellbeing</h2>
            <p className="text-muted-text mt-1 text-sm">
              Эти данные принадлежат вам. Общий доступ появляется только после отдельного согласия.
            </p>
          </div>
        </div>
        {error && (
          <p className="text-neon-pink mb-4 text-sm" role="alert">
            {error}
          </p>
        )}
        <div className="grid gap-gap lg:grid-cols-2">
          <form
            className="border-border bg-elevated/25 rounded-2xl border p-4"
            onSubmit={submitAssessment}
          >
            <h3 className="text-text flex items-center gap-2 font-semibold">
              <Sparkles aria-hidden="true" className="text-primary-neon size-4" />
              Быстрая оценка
            </h3>
            <p className="text-muted-text mt-1 text-xs">
              Пять ответов от 0 до 5, результат сохраняется в истории.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {['Настроение', 'Энергия', 'Стресс', 'Поддержка', 'Спокойствие'].map(
                (label, index) => (
                  <Select
                    key={label}
                    label={label}
                    onChange={(value) =>
                      setAnswers((current) =>
                        current.map((item, itemIndex) => (itemIndex === index ? value : item)),
                      )
                    }
                    options={scoreOptions}
                    value={answers[index]}
                  />
                ),
              )}
            </div>
            <Button className="mt-4" disabled={assessmentState.isLoading} type="submit">
              Сохранить оценку
            </Button>
          </form>
          <AnimatedPanel className="bg-elevated/25 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-text font-semibold">Тренды</h3>
              <Button disabled={exportState.isFetching} onClick={() => exportData()} size="s">
                <Download aria-hidden="true" className="size-4" />
                Экспорт
              </Button>
            </div>
            <AsyncState
              error={trends.error}
              hasData={Boolean(trends.data)}
              isLoading={trends.isLoading}
              onRetry={trends.refetch}
            >
              <pre className="text-muted-text mt-3 max-h-48 overflow-auto whitespace-pre-wrap text-xs">
                {JSON.stringify(trends.data ?? {}, null, 2)}
              </pre>
            </AsyncState>
            {exportState.data && (
              <pre className="border-border mt-3 max-h-48 overflow-auto rounded-xl border p-3 text-xs">
                {JSON.stringify(exportState.data, null, 2)}
              </pre>
            )}
          </AnimatedPanel>
        </div>
        <AsyncState
          empty={
            !assessments.isLoading ? (
              <p className="text-muted-text mt-4 text-sm">Оценок пока нет.</p>
            ) : undefined
          }
          error={assessments.error}
          hasData={Boolean(assessments.data)}
          isLoading={assessments.isLoading}
          onRetry={assessments.refetch}
        >
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {(assessments.data ?? []).slice(0, 6).map((assessment) => (
              <div className="border-border rounded-xl border p-3" key={assessment.id}>
                <p className="text-text font-semibold">{assessment.score}/25</p>
                <p className="text-muted-text mt-1 text-xs">
                  {new Date(assessment.createdAt).toLocaleString('ru-RU')}
                </p>
              </div>
            ))}
          </div>
        </AsyncState>
      </AnimatedPanel>

      <div className="grid gap-gap lg:grid-cols-2">
        <AnimatedPanel className="p-5 sm:p-6">
          <h2 className="text-text flex items-center gap-2 font-semibold">
            <HeartHandshake aria-hidden="true" className="text-cyber-cyan size-5" />
            Благодарность
          </h2>
          <form className="mt-4 space-y-3" onSubmit={submitGratitude}>
            <Select
              label="Получатель"
              onChange={setRecipientId}
              options={members}
              value={recipientId}
            />
            <Textarea
              label="Сообщение"
              maxLength={2000}
              onChange={(event) => setGratitudeMessage(event.target.value)}
              value={gratitudeMessage}
            />
            <Button
              disabled={gratitudeState.isLoading || !recipientId || !gratitudeMessage.trim()}
              type="submit"
            >
              Отправить
            </Button>
          </form>
          <AsyncState
            error={gratitudes.error}
            hasData={Boolean(gratitudes.data)}
            isLoading={gratitudes.isLoading}
            onRetry={gratitudes.refetch}
          >
            <div className="mt-4 space-y-2">
              {(gratitudes.data ?? []).slice(0, 6).map((gratitude) => (
                <div
                  className="border-border flex items-start justify-between gap-3 rounded-xl border p-3"
                  key={gratitude.id}
                >
                  <p className="text-muted-text text-sm">{gratitude.message}</p>
                  <Button
                    aria-label="Удалить благодарность"
                    onClick={async () => {
                      await deleteGratitude(gratitude.id).unwrap();
                      refresh();
                    }}
                    size="s"
                  >
                    Удалить
                  </Button>
                </div>
              ))}
            </div>
          </AsyncState>
        </AnimatedPanel>

        <AnimatedPanel className="p-5 sm:p-6">
          <h2 className="text-text flex items-center gap-2 font-semibold">
            <MessageCircleHeart aria-hidden="true" className="text-primary-neon size-5" />
            Запрос поддержки
          </h2>
          <form className="mt-4 space-y-3" onSubmit={submitSupportRequest}>
            <Select
              label="Кому отправить"
              onChange={setRecipientId}
              options={members}
              value={recipientId}
            />
            <Textarea
              label="Сообщение"
              maxLength={2000}
              onChange={(event) => setSupportMessage(event.target.value)}
              value={supportMessage}
            />
            <Button disabled={supportState.isLoading || !recipientId} type="submit">
              Попросить поддержки
            </Button>
          </form>
          <AsyncState
            error={supportRequests.error}
            hasData={Boolean(supportRequests.data)}
            isLoading={supportRequests.isLoading}
            onRetry={supportRequests.refetch}
          >
            <div className="mt-4 space-y-2">
              {(supportRequests.data ?? []).slice(0, 6).map((request) => (
                <div className="border-border rounded-xl border p-3" key={request.id}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-text text-sm">{request.message || 'Без сообщения'}</span>
                    <Select
                      label="Статус"
                      onChange={async (status) => {
                        await updateSupportRequest({
                          id: request.id,
                          status: status as typeof request.status,
                        }).unwrap();
                        refresh();
                      }}
                      options={[
                        { label: 'Открыт', value: 'OPEN' },
                        { label: 'Принят', value: 'ACKNOWLEDGED' },
                        { label: 'Закрыт', value: 'CLOSED' },
                      ]}
                      value={request.status}
                    />
                  </div>
                </div>
              ))}
            </div>
          </AsyncState>
        </AnimatedPanel>
      </div>
    </div>
  );
};
