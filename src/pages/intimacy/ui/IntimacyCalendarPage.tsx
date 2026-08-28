import dayjs from 'dayjs';
import { skipToken } from '@reduxjs/toolkit/query';
import { Check, Heart, LockKeyhole, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  useCalendarQuery,
  useDeleteCheckInMutation,
  useDeleteEventMutation,
  useFindCurrentUserQuery,
  useFindMyFamilyQuery,
  useGetCheckInQuery,
  useGetEventQuery,
  useUpsertCheckInMutation,
  useUpsertEventMutation,
  type FamilyResponseDto,
  type IntimacyCheckInPrivateDto,
} from '@/shared/api';
import {
  AnimatedPanel,
  AsyncState,
  Button,
  Calendar,
  type CalendarDayBadge,
  type CalendarVisiblePeriod,
  HeaderPanel,
  Modal,
  PageLayout,
} from '@/shared/ui';

type Mood = IntimacyCheckInPrivateDto['mood'];
type Preference = IntimacyCheckInPrivateDto['preferences'][number];
type Rating = 'GREAT' | 'GOOD' | 'NEUTRAL';

const moods: ReadonlyArray<{ emoji: string; label: string; value: Mood }> = [
  { emoji: '🔥', label: 'Хочу близости', value: 'SEX' },
  { emoji: '💋', label: 'Хочу нежности', value: 'TENDERNESS' },
  { emoji: '🫂', label: 'Хочу просто быть рядом', value: 'CLOSENESS' },
  { emoji: '🎲', label: 'Готов(а) к эксперименту', value: 'EXPERIMENT' },
  { emoji: '😴', label: 'Сегодня не хочу', value: 'NOT_TODAY' },
  { emoji: '❓', label: 'Пока не знаю', value: 'UNSURE' },
];

const preferences: ReadonlyArray<{ label: string; value: Preference }> = [
  { label: 'Поцелуи', value: 'KISSING' },
  { label: 'Массаж', value: 'MASSAGE' },
  { label: 'Секс', value: 'SEX' },
  { label: 'Совместный душ', value: 'SHOWER' },
  { label: 'Романтика', value: 'ROMANTIC' },
  { label: 'Эксперимент', value: 'EXPERIMENT' },
  { label: 'Другое', value: 'OTHER' },
];

const ratingOptions: ReadonlyArray<{ label: string; value: Rating }> = [
  { label: '❤️ Отлично', value: 'GREAT' },
  { label: '🙂 Хорошо', value: 'GOOD' },
  { label: '😐 Обычно', value: 'NEUTRAL' },
];

const toDateKey = (date: Date) => dayjs(date).format('YYYY-MM-DD');
const dayTitle = (date: string) => dayjs(date).locale('ru').format('D MMMM YYYY');
const preferenceLabel = (value: Preference) =>
  preferences.find((preference) => preference.value === value)?.label ?? value;

const isIntimacyAvailable = (family: FamilyResponseDto | undefined, currentUserId?: string) => {
  const partners = family?.members.filter((member) => member.role === 'PARTNER') ?? [];
  return partners.length === 2 && partners.some((member) => member.user.id === currentUserId);
};

type DayDetailProps = {
  calendarDay?: { intimacyEventExists: boolean };
  date: string;
  onClose: () => void;
};

const DayDetail = ({ calendarDay, date, onClose }: DayDetailProps) => {
  const checkIn = useGetCheckInQuery({ date });
  const event = useGetEventQuery(calendarDay?.intimacyEventExists ? { date } : skipToken);
  const [upsertCheckIn, checkInState] = useUpsertCheckInMutation();
  const [deleteCheckIn, deleteCheckInState] = useDeleteCheckInMutation();
  const [upsertEvent, eventState] = useUpsertEventMutation();
  const [deleteEvent, deleteEventState] = useDeleteEventMutation();
  const [mood, setMood] = useState<Mood>('UNSURE');
  const [desireLevel, setDesireLevel] = useState(3);
  const [selectedPreferences, setSelectedPreferences] = useState<Preference[]>([]);
  const [rating, setRating] = useState<Rating>('GOOD');

  useEffect(() => {
    if (!checkIn.data?.myCheckIn) return;
    setMood(checkIn.data.myCheckIn.mood);
    setDesireLevel(checkIn.data.myCheckIn.desireLevel);
    setSelectedPreferences(checkIn.data.myCheckIn.preferences);
  }, [checkIn.data?.myCheckIn]);

  useEffect(() => {
    if (event.data?.rating) setRating(event.data.rating);
  }, [event.data?.rating]);

  const togglePreference = (preference: Preference) => {
    setSelectedPreferences((current) =>
      current.includes(preference)
        ? current.filter((value) => value !== preference)
        : [...current, preference],
    );
  };

  const saveCheckIn = async () => {
    await upsertCheckIn({
      date,
      upsertIntimacyCheckInDto: { desireLevel, mood, preferences: selectedPreferences },
    }).unwrap();
  };

  const hasEvent = Boolean(event.data?.occurred);
  const isBusy =
    checkInState.isLoading ||
    deleteCheckInState.isLoading ||
    eventState.isLoading ||
    deleteEventState.isLoading;
  const matchContent = (() => {
    if (!checkIn.data?.myCheckIn || !checkIn.data.aggregate) {
      return (
        <p className="text-muted-text mt-2 text-sm">Совпадение появится после ответов обоих.</p>
      );
    }

    if (!checkIn.data.aggregate.hasMutualInterest) {
      return <p className="text-muted-text mt-2 text-sm">Сегодня совпадений нет</p>;
    }

    return (
      <div className="mt-2 text-sm">
        <p className="text-neon-pink font-medium">❤️ Есть совпадение</p>
        {checkIn.data.aggregate.matchedPreferences.length > 0 && (
          <>
            <p className="text-muted-text mt-3">Совпало:</p>
            <ul className="text-text mt-1 space-y-1">
              {checkIn.data.aggregate.matchedPreferences.map((preference) => (
                <li key={preference}>• {preferenceLabel(preference)}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    );
  })();

  const updateRating = (nextRating: Rating) => {
    setRating(nextRating);
    upsertEvent({
      date,
      upsertIntimacyEventDto: { occurred: true, rating: nextRating },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-primary-neon flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]">
          <LockKeyhole aria-hidden="true" className="size-3.5" /> Только для вас двоих
        </p>
        <h2 className="text-text mt-2 text-xl font-semibold">{dayTitle(date)}</h2>
      </div>

      <AsyncState
        error={checkIn.error}
        errorMessage="Не удалось загрузить состояние дня"
        hasData={Boolean(checkIn.data)}
        isLoading={checkIn.isLoading}
        loading={<div className="h-72 animate-pulse rounded-2xl bg-elevated/50" />}
        onRetry={() => checkIn.refetch()}
      >
        <section aria-labelledby="my-check-in" className="border-border/80 rounded-2xl border p-4">
          <h3 className="text-text font-semibold" id="my-check-in">
            Мой настрой
          </h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {moods.map((item) => {
              const isSelected = mood === item.value;
              return (
                <button
                  aria-pressed={isSelected}
                  className={`rounded-xl border px-3 py-2.5 text-left text-sm transition outline-none focus-visible:ring-2 focus-visible:ring-cyber-cyan ${
                    isSelected
                      ? 'border-primary-neon bg-primary-neon/15 text-text shadow-[0_0_18px_color-mix(in_srgb,var(--color-primary-neon)_24%,transparent)]'
                      : 'border-border bg-elevated/45 text-muted-text hover:border-primary-neon/50 hover:text-text'
                  }`}
                  key={item.value}
                  onClick={() => setMood(item.value)}
                  type="button"
                >
                  <span aria-hidden="true" className="mr-2">
                    {item.emoji}
                  </span>
                  {item.label}
                </button>
              );
            })}
          </div>
          <div className="mt-5">
            <p className="text-muted-text text-sm">Уровень желания: {desireLevel}</p>
            <div aria-label="Уровень желания" className="mt-2 grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  aria-label={`Уровень желания ${level}`}
                  aria-pressed={desireLevel === level}
                  className={`h-10 rounded-xl border text-sm font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-cyber-cyan ${
                    desireLevel === level
                      ? 'border-neon-pink bg-neon-pink/20 text-text'
                      : 'border-border bg-elevated/45 text-muted-text hover:border-neon-pink/50'
                  }`}
                  key={level}
                  onClick={() => setDesireLevel(level)}
                  type="button"
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-5">
            <p className="text-muted-text text-sm">Предпочтения</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {preferences.map((preference) => {
                const isSelected = selectedPreferences.includes(preference.value);
                return (
                  <button
                    aria-pressed={isSelected}
                    className={`rounded-full border px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-cyber-cyan ${
                      isSelected
                        ? 'border-cyber-cyan bg-cyber-cyan/10 text-text'
                        : 'border-border bg-elevated/45 text-muted-text hover:border-cyber-cyan/50'
                    }`}
                    key={preference.value}
                    onClick={() => togglePreference(preference.value)}
                    type="button"
                  >
                    {preference.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            {checkIn.data?.myCheckIn && (
              <Button
                disabled={isBusy}
                icon={<Trash2 className="size-4" />}
                onClick={() => deleteCheckIn({ date })}
                size="s"
              >
                Удалить ответ
              </Button>
            )}
            <Button
              disabled={isBusy}
              icon={<Check className="size-4" />}
              isLoading={checkInState.isLoading}
              onClick={saveCheckIn}
              size="s"
            >
              Сохранить
            </Button>
          </div>
        </section>

        <section
          aria-labelledby="partner-check-in"
          className="border-border/80 rounded-2xl border p-4"
        >
          <h3 className="text-text font-semibold" id="partner-check-in">
            Настрой партнёра
          </h3>
          <p className="text-muted-text mt-2 text-sm">
            {checkIn.data?.partnerHasAnswered ? 'Партнёр уже ответил' : 'Партнёр пока не ответил'}
          </p>
        </section>

        <section aria-labelledby="match" className="border-border/80 rounded-2xl border p-4">
          <h3 className="text-text font-semibold" id="match">
            Совпадение
          </h3>
          {matchContent}
        </section>

        <section
          aria-labelledby="intimacy-event"
          className="border-border/80 rounded-2xl border p-4"
        >
          <h3 className="text-text font-semibold" id="intimacy-event">
            Факт близости
          </h3>
          {hasEvent ? (
            <>
              <p className="text-cyber-cyan mt-2 text-sm">✓ Близость отмечена</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {ratingOptions.map((option) => (
                  <button
                    aria-pressed={rating === option.value}
                    className={`rounded-xl border px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-cyber-cyan ${
                      rating === option.value
                        ? 'border-neon-pink bg-neon-pink/15 text-text'
                        : 'border-border text-muted-text hover:border-neon-pink/50'
                    }`}
                    key={option.value}
                    onClick={() => updateRating(option.value)}
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <Button
                className="mt-4"
                disabled={isBusy}
                icon={<Trash2 className="size-4" />}
                onClick={() => deleteEvent({ date })}
                size="s"
              >
                Удалить отметку
              </Button>
            </>
          ) : (
            <>
              <p className="text-muted-text mt-2 text-sm">Близость сегодня была?</p>
              <Button
                className="mt-4"
                disabled={isBusy}
                icon={<Heart className="size-4" />}
                isLoading={eventState.isLoading}
                onClick={() =>
                  upsertEvent({ date, upsertIntimacyEventDto: { occurred: true, rating } })
                }
                size="s"
              >
                Да
              </Button>
            </>
          )}
        </section>
      </AsyncState>
      <div className="flex justify-end">
        <Button disabled={isBusy} onClick={onClose} size="s">
          Готово
        </Button>
      </div>
    </div>
  );
};

export const IntimacyCalendarPage = () => {
  const family = useFindMyFamilyQuery();
  const currentUser = useFindCurrentUserQuery();
  const [visiblePeriod, setVisiblePeriod] = useState<{ from: string; to: string }>();
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const [detailDate, setDetailDate] = useState<string>();
  const calendar = useCalendarQuery(visiblePeriod ?? skipToken);
  const handleVisiblePeriodChange = useCallback(({ from, toExclusive }: CalendarVisiblePeriod) => {
    const nextPeriod = {
      from: toDateKey(from),
      to: toDateKey(dayjs(toExclusive).subtract(1, 'day').toDate()),
    };

    setVisiblePeriod((currentPeriod) =>
      currentPeriod?.from === nextPeriod.from && currentPeriod.to === nextPeriod.to
        ? currentPeriod
        : nextPeriod,
    );
  }, []);
  const canUseIntimacy = isIntimacyAvailable(family.data, currentUser.data?.id);
  const calendarByDate = useMemo(
    () => new Map((calendar.data ?? []).map((day) => [day.date, day])),
    [calendar.data],
  );
  const dayBadges = useMemo<CalendarDayBadge[]>(
    () =>
      (calendar.data ?? []).flatMap((day) => {
        const date = dayjs(day.date).toDate();
        const badges: CalendarDayBadge[] = [];
        if (day.myCheckInExists) {
          badges.push({
            date,
            id: `${day.date}-check-in`,
            label: day.partnerCheckInExists ? '••' : '•',
            tone: day.partnerCheckInExists ? 'accent' : 'default',
          });
        }
        if (day.hasMutualInterest)
          badges.push({ date, id: `${day.date}-match`, label: '♥', tone: 'accent' });
        if (day.intimacyEventExists)
          badges.push({ date, id: `${day.date}-event`, label: '✓', tone: 'success' });
        return badges;
      }),
    [calendar.data],
  );

  if (!family.isLoading && !currentUser.isLoading && !canUseIntimacy) {
    return (
      <PageLayout>
        <AnimatedPanel className="mx-auto flex min-h-60 max-w-xl items-center justify-center p-8 text-center">
          <LockKeyhole aria-hidden="true" className="text-primary-neon size-9" />
          <h1 className="text-text mt-4 text-xl font-semibold">Раздел доступен только паре</h1>
          <p className="text-muted-text mt-2 text-sm">
            Интимный календарь не показывается детям и другим участникам семьи.
          </p>
        </AnimatedPanel>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <HeaderPanel
        left={
          <>
            <p className="text-primary-neon flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
              <LockKeyhole aria-hidden="true" className="size-3.5" /> Для двоих
            </p>
            <h1 className="text-text mt-1 text-2xl font-semibold sm:text-3xl">
              Интимный календарь
            </h1>
            <p className="text-muted-text mt-1 text-sm">🔒 Только для вас двоих</p>
          </>
        }
      />
      <AnimatedPanel className="min-h-[38rem] p-0">
        <AsyncState
          error={calendar.error}
          errorMessage="Не удалось загрузить календарь"
          hasData={Boolean(calendar.data)}
          isLoading={calendar.isLoading}
          loading={<div className="h-[38rem] animate-pulse rounded-3xl bg-elevated/50" />}
          onRetry={() => calendar.refetch()}
        >
          <Calendar
            className="min-h-[38rem] rounded-3xl border-0 shadow-none"
            dayBadges={dayBadges}
            onChangePeriod={(period) => setSelectedDate(toDateKey(period.from))}
            onClickDay={(date) => {
              const nextDate = toDateKey(date);
              setSelectedDate(nextDate);
              setDetailDate(nextDate);
            }}
            onVisiblePeriodChange={handleVisiblePeriodChange}
            selectedPeriod={{
              from: dayjs(selectedDate).toDate(),
              to: dayjs(selectedDate).toDate(),
            }}
            selectionMode="single"
            timeZone={family.data?.timeZone}
          />
        </AsyncState>
      </AnimatedPanel>
      <Modal
        ariaLabel="Интимный календарь: детали дня"
        contentClassName="max-w-2xl p-5 sm:p-6"
        onClose={() => setDetailDate(undefined)}
        open={Boolean(detailDate)}
      >
        {detailDate && (
          <DayDetail
            calendarDay={calendarByDate.get(detailDate)}
            date={detailDate}
            onClose={() => setDetailDate(undefined)}
          />
        )}
      </Modal>
    </PageLayout>
  );
};
