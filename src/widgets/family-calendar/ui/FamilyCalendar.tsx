import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import {
  AlertTriangle,
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { getAccessTokenSubject, selectAccessToken, selectCurrentUser } from '@/entities/user';
import {
  FamilyEventForm,
  formatFamilyEventTime,
  getFamilyDateKey,
  useConfirmFamilyEventMutation,
  useFindFamilyEventsQuery,
  useRejectFamilyEventMutation,
  useRemoveFamilyEventMutation,
} from '@/features/family-events';
import type { FamilyEventResponseDto } from '@/shared/api';
import { getApiErrorMessage, useFindMyFamilyQuery, useListQuery } from '@/shared/api';
import { AsyncState, Button, Calendar } from '@/shared/ui';
import type { CalendarVisiblePeriod, PlannedItem } from '@/shared/ui';

type Notice = { message: string; type: 'error' | 'success' };
type PanelMode = 'agenda' | 'create' | 'details' | 'edit';

const statusMeta: Record<FamilyEventResponseDto['status'], { className: string; label: string }> = {
  COMPLETED: {
    className: 'border-muted-text/30 bg-muted-text/10 text-muted-text',
    label: 'Завершено',
  },
  CONFIRMED: {
    className: 'border-acid-green/35 bg-acid-green/10 text-acid-green',
    label: 'Подтверждено',
  },
  EVENT_DAY: {
    className: 'border-cyber-cyan/40 bg-cyber-cyan/10 text-cyber-cyan',
    label: 'Сегодня',
  },
  PROPOSED: {
    className: 'border-primary-neon/40 bg-primary-neon/10 text-primary-neon',
    label: 'Ждёт ответа',
  },
  REJECTED: {
    className: 'border-neon-pink/35 bg-neon-pink/10 text-neon-pink',
    label: 'Отклонено',
  },
};

const isFamilyMissingError = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'status' in error &&
  (error.status === 403 || error.status === 404);

const formatSelectedDate = (date: string) => dayjs(date).locale('ru').format('D MMMM YYYY, dddd');

const formatEventDateTime = (instant: string, timeZone: string, locale: string) =>
  new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'long',
    timeZone,
    year: 'numeric',
  }).format(new Date(instant));

const getInitialVisiblePeriod = (): CalendarVisiblePeriod => {
  const monthStart = dayjs().startOf('month');
  const mondayOffset = (monthStart.day() + 6) % 7;
  const from = monthStart.subtract(mondayOffset, 'day');

  return { from: from.toDate(), toExclusive: from.add(42, 'day').toDate() };
};

const CalendarSkeleton = () => (
  <div
    aria-label="Загрузка семейного календаря"
    className="border-border bg-surface/65 grid min-h-[560px] place-items-center rounded-3xl border"
    role="status"
  >
    <motion.div
      animate={{ opacity: [0.3, 1, 0.3], rotate: [0, 180, 360] }}
      transition={{ duration: 2.4, repeat: Infinity }}
    >
      <CalendarDays className="text-primary-neon h-12 w-12" strokeWidth={1.3} />
    </motion.div>
  </div>
);

type DayAgendaProps = {
  events: FamilyEventResponseDto[];
  onCreate: () => void;
  onOpen: (event: FamilyEventResponseDto) => void;
  selectedDate: string;
  timeZone: string;
};

const DayAgenda = ({ events, onCreate, onOpen, selectedDate, timeZone }: DayAgendaProps) => (
  <div className="flex h-full min-h-0 flex-col">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-primary-neon text-xs font-semibold uppercase tracking-[0.18em]">
          План дня
        </p>
        <h2 className="text-text mt-1 text-lg font-semibold first-letter:uppercase">
          {formatSelectedDate(selectedDate)}
        </h2>
      </div>
      <Button onClick={onCreate} size="s">
        <span className="flex items-center gap-1.5">
          <Plus aria-hidden="true" className="h-4 w-4" />
          Событие
        </span>
      </Button>
    </div>

    {events.length === 0 ? (
      <div className="border-border bg-elevated/25 text-muted-text mt-5 grid min-h-44 place-items-center rounded-2xl border border-dashed p-5 text-center">
        <div>
          <CalendarDays className="text-primary-neon/70 mx-auto h-7 w-7" />
          <p className="mt-3 text-sm">На этот день пока ничего не запланировано</p>
        </div>
      </div>
    ) : (
      <div className="scrollbar-none mt-5 min-h-0 space-y-3 overflow-auto pr-1">
        {events.map((event) => {
          const meta = statusMeta[event.status];

          return (
            <motion.button
              className="border-border bg-elevated/45 hover:border-primary-neon/60 w-full cursor-pointer rounded-2xl border p-4 text-left outline-none focus-visible:border-cyber-cyan"
              key={event.id}
              onClick={() => onOpen(event)}
              type="button"
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-text truncate text-sm font-semibold">{event.name}</p>
                  <p className="text-muted-text mt-1 flex items-center gap-1.5 text-xs">
                    <Clock3 aria-hidden="true" className="h-3.5 w-3.5" />
                    {formatFamilyEventTime(event.scheduledAt, timeZone)}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2 py-1 text-[10px] ${meta.className}`}
                >
                  {meta.label}
                </span>
              </div>
              <p className="text-muted-text mt-3 flex items-center gap-1.5 truncate text-xs">
                <MapPin aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                {event.location}
              </p>
            </motion.button>
          );
        })}
      </div>
    )}
  </div>
);

type EventDetailsProps = {
  currentUserId: string | null;
  event: FamilyEventResponseDto;
  isDeleting: boolean;
  isResponding: boolean;
  locale: string;
  notice: Notice | null;
  onBack: () => void;
  onConfirm: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onReject: () => void;
  timeZone: string;
};

const EventDetails = ({
  currentUserId,
  event,
  isDeleting,
  isResponding,
  locale,
  notice,
  onBack,
  onConfirm,
  onDelete,
  onEdit,
  onReject,
  timeZone,
}: EventDetailsProps) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const meta = statusMeta[event.status];
  const isCreator = currentUserId === event.proposedBy.id;
  const canRespond = Boolean(currentUserId && !isCreator && event.status === 'PROPOSED');
  const canEdit = Boolean(isCreator && dayjs(event.scheduledAt).isAfter(dayjs()));

  return (
    <div className="scrollbar-none h-full min-h-0 overflow-auto pr-1">
      <button
        className="text-muted-text hover:text-cyber-cyan cursor-pointer text-xs outline-none"
        onClick={onBack}
        type="button"
      >
        ← Вернуться к плану дня
      </button>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs ${meta.className}`}>
            {meta.label}
          </span>
          <h2 className="text-text mt-3 text-xl font-semibold">{event.name}</h2>
        </div>
      </div>

      <div className="border-border bg-elevated/35 mt-5 space-y-3 rounded-2xl border p-4 text-sm">
        <p className="text-muted-text flex items-start gap-2">
          <Clock3 aria-hidden="true" className="text-cyber-cyan mt-0.5 h-4 w-4 shrink-0" />
          <span>{formatEventDateTime(event.scheduledAt, timeZone, locale)}</span>
        </p>
        <p className="text-muted-text flex items-start gap-2">
          <MapPin aria-hidden="true" className="text-neon-pink mt-0.5 h-4 w-4 shrink-0" />
          <span>{event.location}</span>
        </p>
        <p className="text-muted-text flex items-start gap-2">
          <UserRound aria-hidden="true" className="text-primary-neon mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Предложил: {event.proposedBy.firstName} {event.proposedBy.lastName}
          </span>
        </p>
      </div>

      {event.description && (
        <p className="text-muted-text mt-5 whitespace-pre-wrap text-sm leading-relaxed">
          {event.description}
        </p>
      )}

      {notice && (
        <p
          className={`mt-5 rounded-xl border px-4 py-2.5 text-sm ${
            notice.type === 'success'
              ? 'border-acid-green/35 bg-acid-green/10 text-acid-green'
              : 'border-neon-pink/35 bg-neon-pink/10 text-neon-pink'
          }`}
          role="status"
        >
          {notice.message}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        {canRespond && (
          <>
            <Button disabled={isResponding} onClick={onConfirm} size="s">
              <span className="flex items-center gap-1.5">
                <Check aria-hidden="true" className="h-4 w-4" />
                Подтвердить
              </span>
            </Button>
            <Button
              className="border-neon-pink/60 text-neon-pink hover:bg-neon-pink/10"
              disabled={isResponding}
              onClick={onReject}
              size="s"
            >
              <span className="flex items-center gap-1.5">
                <X aria-hidden="true" className="h-4 w-4" />
                Отклонить
              </span>
            </Button>
          </>
        )}
        {canEdit && (
          <Button onClick={onEdit} size="s">
            <span className="flex items-center gap-1.5">
              <Pencil aria-hidden="true" className="h-4 w-4" />
              Изменить
            </span>
          </Button>
        )}
        {isCreator && (
          <Button
            className="border-neon-pink/60 text-neon-pink hover:bg-neon-pink/10"
            onClick={() => setIsConfirmingDelete(true)}
            size="s"
          >
            <span className="flex items-center gap-1.5">
              <Trash2 aria-hidden="true" className="h-4 w-4" />
              Удалить
            </span>
          </Button>
        )}
      </div>

      <AnimatePresence>
        {isConfirmingDelete && (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="border-neon-pink/35 bg-neon-pink/5 mt-5 rounded-2xl border p-4"
            exit={{ opacity: 0, y: -6 }}
            initial={{ opacity: 0, y: -6 }}
          >
            <div className="flex gap-3">
              <AlertTriangle className="text-neon-pink h-5 w-5 shrink-0" />
              <div>
                <p className="text-text text-sm font-semibold">Удалить событие?</p>
                <p className="text-muted-text mt-1 text-xs">Оно исчезнет из семейного календаря.</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                className="border-neon-pink/70 text-neon-pink"
                disabled={isDeleting}
                onClick={onDelete}
                size="s"
              >
                {isDeleting ? 'Удаляем…' : 'Да, удалить'}
              </Button>
              <Button disabled={isDeleting} onClick={() => setIsConfirmingDelete(false)} size="s">
                Отмена
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const FamilyCalendar = () => {
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const accessToken = useSelector(selectAccessToken);
  const currentUserId = currentUser?.id ?? getAccessTokenSubject(accessToken);
  const familyQuery = useFindMyFamilyQuery();
  const family = familyQuery.data;
  const timeZone = family?.timeZone ?? 'Europe/Moscow';
  const locale = family?.locale ?? 'ru-RU';
  const [visiblePeriod, setVisiblePeriod] = useState(getInitialVisiblePeriod);
  const [selectedDate, setSelectedDate] = useState(() => getFamilyDateKey(new Date(), timeZone));
  const [mode, setMode] = useState<PanelMode>('agenda');
  const [focusedEvent, setFocusedEvent] = useState<FamilyEventResponseDto>();
  const [notice, setNotice] = useState<Notice | null>(null);
  const eventsQuery = useFindFamilyEventsQuery(
    {
      dateFrom: dayjs(visiblePeriod.from).format('YYYY-MM-DD'),
      dateTo: dayjs(visiblePeriod.toExclusive).format('YYYY-MM-DD'),
      limit: 100,
      page: 1,
    },
    { skip: !family },
  );
  const tasksQuery = useListQuery({ page: 1, limit: 100 }, { skip: !family });
  const [confirmFamilyEvent, confirmState] = useConfirmFamilyEventMutation();
  const [rejectFamilyEvent, rejectState] = useRejectFamilyEventMutation();
  const [removeFamilyEvent, removeState] = useRemoveFamilyEventMutation();
  const events = useMemo(() => eventsQuery.data?.data ?? [], [eventsQuery.data?.data]);
  const tasks = useMemo(() => {
    const payload = tasksQuery.data as unknown as { data?: Array<{ id: string; title: string; dueAt?: object | null; status: string }> } | undefined;
    return (payload?.data ?? []).filter((task) => task.status !== 'ARCHIVED' && typeof task.dueAt === 'string');
  }, [tasksQuery.data]);
  const isResponding = confirmState.isLoading || rejectState.isLoading;

  useEffect(() => {
    if (family) {
      setSelectedDate(getFamilyDateKey(new Date(), family.timeZone));
    }
  }, [family]);

  useEffect(() => {
    if (!focusedEvent) return;

    const refreshedEvent = events.find((event) => event.id === focusedEvent.id);
    if (refreshedEvent && refreshedEvent.updatedAt !== focusedEvent.updatedAt) {
      setFocusedEvent(refreshedEvent);
    }
  }, [events, focusedEvent]);

  const plannedItems = useMemo<PlannedItem[]>(
    () => [
      ...events.map((event) => ({
        date: new Date(event.scheduledAt),
        id: `event:${event.id}`,
        name: event.name,
      })),
      ...tasks.map((task) => ({
        date: new Date(task.dueAt as unknown as string),
        id: `task:${task.id}`,
        name: `Задача: ${task.title}`,
      })),
    ],
    [events, tasks],
  );
  const selectedDayEvents = useMemo(
    () => events.filter((event) => getFamilyDateKey(event.scheduledAt, timeZone) === selectedDate),
    [events, selectedDate, timeZone],
  );
  const selectedPeriod = useMemo(() => {
    const date = new Date(`${selectedDate}T00:00:00`);
    return { from: date, to: date };
  }, [selectedDate]);
  const handleVisiblePeriodChange = useCallback((period: CalendarVisiblePeriod) => {
    setVisiblePeriod(period);
  }, []);

  const openEvent = (event: FamilyEventResponseDto) => {
    setFocusedEvent(event);
    setNotice(null);
    setMode('details');
  };

  const handleDecision = async (decision: 'confirm' | 'reject') => {
    if (!focusedEvent) return;
    setNotice(null);

    try {
      const updated =
        decision === 'confirm'
          ? await confirmFamilyEvent({ id: focusedEvent.id }).unwrap()
          : await rejectFamilyEvent({ id: focusedEvent.id }).unwrap();
      setFocusedEvent(updated);
      setNotice({
        message: decision === 'confirm' ? 'Событие подтверждено' : 'Событие отклонено',
        type: 'success',
      });
    } catch (error) {
      setNotice({
        message: getApiErrorMessage(error, 'Не удалось ответить на предложение'),
        type: 'error',
      });
    }
  };

  const handleDelete = async () => {
    if (!focusedEvent) return;
    setNotice(null);

    try {
      await removeFamilyEvent({ id: focusedEvent.id }).unwrap();
      setFocusedEvent(undefined);
      setMode('agenda');
      setNotice({ message: 'Событие удалено', type: 'success' });
    } catch (error) {
      setNotice({
        message: getApiErrorMessage(error, 'Не удалось удалить событие'),
        type: 'error',
      });
    }
  };

  if (familyQuery.isLoading) {
    return (
      <AsyncState hasData={false} isLoading loading={<CalendarSkeleton />}>
        <div />
      </AsyncState>
    );
  }

  if (!family && isFamilyMissingError(familyQuery.error)) {
    return (
      <section className="border-border bg-surface/70 grid min-h-[520px] place-items-center rounded-3xl border p-8 text-center">
        <div className="max-w-md">
          <CalendarDays className="text-primary-neon mx-auto h-11 w-11" strokeWidth={1.4} />
          <h1 className="text-text mt-5 text-2xl font-semibold">
            Календарь появится вместе с семьёй
          </h1>
          <p className="text-muted-text mt-3 text-sm leading-relaxed">
            Создайте семейное пространство с партнёром, чтобы предлагать и подтверждать общие планы.
          </p>
          <Button className="mt-6" onClick={() => navigate('/all_users')}>
            Найти партнёра
          </Button>
        </div>
      </section>
    );
  }

  if (!family) {
    return (
      <AsyncState
        error={familyQuery.error}
        errorMessage="Не удалось загрузить настройки семьи"
        hasData={false}
        loading={<CalendarSkeleton />}
        onRetry={familyQuery.refetch}
      >
        <div />
      </AsyncState>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 pb-24">
      <header className="flex shrink-0 flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-primary-neon flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
            <CalendarDays aria-hidden="true" className="h-4 w-4" />
            Семейный календарь
          </p>
          <h1 className="text-text mt-2 text-2xl font-semibold sm:text-3xl">Общие планы</h1>
          <p className="text-muted-text mt-1 text-xs">
            Часовой пояс: {timeZone} · изменения подтверждаются партнёром
          </p>
        </div>
        <Button
          onClick={() => {
            setFocusedEvent(undefined);
            setNotice(null);
            setMode('create');
          }}
          size="s"
        >
          <span className="flex items-center gap-1.5">
            <Plus aria-hidden="true" className="h-4 w-4" />
            Добавить событие
          </span>
        </Button>
      </header>

      {notice && mode === 'agenda' && (
        <p
          className={`shrink-0 rounded-xl border px-4 py-2.5 text-sm ${
            notice.type === 'success'
              ? 'border-acid-green/35 bg-acid-green/10 text-acid-green'
              : 'border-neon-pink/35 bg-neon-pink/10 text-neon-pink'
          }`}
          role="status"
        >
          {notice.message}
        </p>
      )}

      <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(300px,0.42fr)_minmax(620px,1fr)]">
        <motion.aside
          className="border-border bg-surface/75 min-h-[360px] h-full overflow-auto rounded-3xl border p-4 backdrop-blur-xl sm:p-5 xl:min-h-0"
          layout
        >
          {mode === 'create' && (
            <FamilyEventForm
              initialDate={selectedDate}
              mode="create"
              onCancel={() => setMode('agenda')}
              onSuccess={(event) => {
                setFocusedEvent(event);
                setSelectedDate(getFamilyDateKey(event.scheduledAt, timeZone));
                setNotice({ message: 'Событие предложено партнёру', type: 'success' });
                setMode('details');
              }}
              timeZone={timeZone}
            />
          )}

          {mode === 'edit' && focusedEvent && (
            <FamilyEventForm
              initialValue={focusedEvent}
              mode="edit"
              onCancel={() => setMode('details')}
              onSuccess={(event) => {
                setFocusedEvent(event);
                setSelectedDate(getFamilyDateKey(event.scheduledAt, timeZone));
                setNotice({ message: 'Изменения отправлены партнёру', type: 'success' });
                setMode('details');
              }}
              timeZone={timeZone}
            />
          )}

          {mode === 'details' && focusedEvent && (
            <EventDetails
              currentUserId={currentUserId}
              event={focusedEvent}
              isDeleting={removeState.isLoading}
              isResponding={isResponding}
              locale={locale}
              notice={notice}
              onBack={() => {
                setNotice(null);
                setMode('agenda');
              }}
              onConfirm={() => handleDecision('confirm')}
              onDelete={handleDelete}
              onEdit={() => {
                setNotice(null);
                setMode('edit');
              }}
              onReject={() => handleDecision('reject')}
              timeZone={timeZone}
            />
          )}

          {mode === 'agenda' && (
            <DayAgenda
              events={selectedDayEvents}
              onCreate={() => {
                setNotice(null);
                setMode('create');
              }}
              onOpen={openEvent}
              selectedDate={selectedDate}
              timeZone={timeZone}
            />
          )}
        </motion.aside>

        <div className="relative min-h-[560px] min-w-0">
          {eventsQuery.isLoading && !eventsQuery.data ? (
            <CalendarSkeleton />
          ) : (
            <Calendar
              className="min-h-[560px]"
              onClickDay={(day, item) => {
                if (item) {
                  const [kind, id] = String(item.id).split(':');
                  if (kind === 'event') {
                    const event = events.find((candidate) => candidate.id === id);
                    if (event) openEvent(event);
                  } else if (kind === 'task') {
                    navigate('/tasks');
                  }
                  return;
                }

                setSelectedDate(dayjs(day).format('YYYY-MM-DD'));
                setNotice(null);
                setMode('agenda');
              }}
              onVisiblePeriodChange={handleVisiblePeriodChange}
              plannedItems={plannedItems}
              selectedPeriod={selectedPeriod}
              selectionMode="single"
              timeZone={timeZone}
            />
          )}

          {eventsQuery.error && !eventsQuery.data && (
            <div className="bg-background/80 absolute inset-0 grid place-items-center rounded-3xl p-6 text-center backdrop-blur-sm">
              <div>
                <p className="text-neon-pink">Не удалось загрузить события</p>
                <Button className="mt-4" onClick={() => eventsQuery.refetch()} size="s">
                  <span className="flex items-center gap-1.5">
                    <RefreshCw aria-hidden="true" className="h-4 w-4" />
                    Повторить
                  </span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
