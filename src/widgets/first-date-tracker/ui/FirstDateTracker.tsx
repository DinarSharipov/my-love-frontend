import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import {
  AlertTriangle,
  CheckCircle2,
  Heart,
  Pencil,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';

import {
  FirstDateForm,
  useFindMyFirstDateQuery,
  useRemoveFirstDateMutation,
} from '@/features/first-date';
import type { FirstDateResponseDto } from '@/shared/api';
import { getApiErrorMessage } from '@/shared/api';
import { AnimatedPanel, Button } from '@/shared/ui';

const milestones = [
  { label: '1 месяц', months: 1 },
  { label: '6 месяцев', months: 6 },
  { label: '1 год', months: 12 },
  { label: '5 лет', months: 60 },
  { label: '10 лет', months: 120 },
  { label: '20 лет', months: 240 },
  { label: '30 лет', months: 360 },
] as const;

type FormMode = 'create' | 'edit' | 'view';
type Notice = { message: string; type: 'error' | 'success' };

const isApiErrorStatus = (error: unknown, status: number) =>
  typeof error === 'object' && error !== null && 'status' in error && error.status === status;

const getTimelineProgress = (firstDate: dayjs.Dayjs, today: dayjs.Dayjs) => {
  if (today.isBefore(firstDate, 'day')) return 0;

  const milestoneIndex = milestones.findIndex(({ months }) =>
    today.isBefore(firstDate.add(months, 'month'), 'day'),
  );

  if (milestoneIndex === -1) return 100;

  const segmentStart =
    milestoneIndex === 0
      ? firstDate
      : firstDate.add(milestones[milestoneIndex - 1].months, 'month');
  const segmentEnd = firstDate.add(milestones[milestoneIndex].months, 'month');
  const segmentDuration = segmentEnd.diff(segmentStart, 'day');
  const elapsedInSegment = today.diff(segmentStart, 'day');
  const segmentProgress = Math.max(0, Math.min(1, elapsedInSegment / segmentDuration));

  return ((milestoneIndex + segmentProgress) / milestones.length) * 100;
};

const TrackerSkeleton = () => (
  <div
    aria-label="Загрузка даты первой встречи"
    className="border-border bg-surface/65 relative min-h-52 overflow-hidden rounded-3xl border p-5 backdrop-blur-xl"
    role="status"
  >
    <motion.div
      animate={{ x: ['-120%', '220%'] }}
      className="via-primary-neon/10 absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent to-transparent blur-xl"
      transition={{ duration: 1.8, ease: 'easeInOut', repeat: Infinity }}
    />
    <div className="bg-elevated mb-4 h-5 w-36 animate-pulse rounded-full" />
    <div className="bg-elevated mb-8 h-12 w-48 animate-pulse rounded-2xl" />
    <div className="bg-elevated h-2 w-full animate-pulse rounded-full" />
  </div>
);

const NoticeBanner = ({ notice }: { notice: Notice | null }) => (
  <AnimatePresence mode="wait">
    {notice && (
      <motion.p
        animate={{ opacity: 1, y: 0 }}
        className={`relative mb-4 rounded-xl border px-4 py-2.5 text-sm ${
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
);

type EmptyFirstDateProps = {
  canCreate: boolean;
  notice: Notice | null;
  onCreate: () => void;
  onRetry: () => void;
};

const EmptyFirstDate = ({ canCreate, notice, onCreate, onRetry }: EmptyFirstDateProps) => (
  <AnimatedPanel className="relative grid min-h-64 place-items-center p-6 text-center">
    <div className="relative w-full overflow-hidden rounded-3xl">
      <div className="bg-primary-neon/10 absolute h-36 w-36 rounded-full blur-3xl" />
      <div className="relative w-full">
        <NoticeBanner notice={notice} />
        <Heart className="text-primary-neon mx-auto mb-3 h-8 w-8" strokeWidth={1.5} />
        <p className="text-text text-sm font-medium">
          {canCreate
            ? 'Дата первой встречи пока не добавлена'
            : 'Не удалось загрузить историю вашей встречи'}
        </p>
        <p className="text-muted-text mt-1 text-xs">
          {canCreate
            ? 'Сохраните момент, с которого началась ваша общая история'
            : 'Попробуйте запросить данные ещё раз'}
        </p>
        <div className="mt-5 flex justify-center">
          {canCreate ? (
            <Button
              icon={<Plus aria-hidden="true" className="h-4 w-4" />}
              onClick={onCreate}
              size="s"
            >
              <span>Добавить встречу</span>
            </Button>
          ) : (
            <Button
              icon={<RefreshCw aria-hidden="true" className="h-4 w-4" />}
              onClick={onRetry}
              size="s"
            >
              <span>Повторить</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  </AnimatedPanel>
);

export const FirstDateTracker = () => {
  const { data, error, isLoading, refetch } = useFindMyFirstDateQuery();
  const [removeFirstDate, removeState] = useRemoveFirstDateMutation();
  const [mode, setMode] = useState<FormMode>('view');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isLocallyRemoved, setIsLocallyRemoved] = useState(false);
  const [savedValue, setSavedValue] = useState<FirstDateResponseDto>();
  const [notice, setNotice] = useState<Notice | null>(null);
  const firstDateData = isLocallyRemoved ? undefined : (savedValue ?? data);

  useEffect(() => {
    if (savedValue && data?.updatedAt === savedValue.updatedAt) {
      setSavedValue(undefined);
    }
  }, [data?.updatedAt, savedValue]);

  if (isLoading && !data && !isLocallyRemoved)
    return (
      <AnimatedPanel className="min-h-52 p-0">
        <TrackerSkeleton />
      </AnimatedPanel>
    );

  const openForm = (nextMode: Exclude<FormMode, 'view'>) => {
    setMode(nextMode);
    setNotice(null);
    setIsConfirmingDelete(false);
  };

  const handleFormSuccess = (
    completedMode: Exclude<FormMode, 'view'>,
    value: FirstDateResponseDto,
  ) => {
    setSavedValue(value);
    setIsLocallyRemoved(false);
    setMode('view');
    setNotice({
      message:
        completedMode === 'create'
          ? 'Дата первой встречи добавлена'
          : 'История первой встречи обновлена',
      type: 'success',
    });
  };

  const handleDelete = async () => {
    setNotice(null);

    try {
      await removeFirstDate().unwrap();
      setSavedValue(undefined);
      setIsLocallyRemoved(true);
      setIsConfirmingDelete(false);
      setNotice({ message: 'Дата первой встречи удалена', type: 'success' });
    } catch (deleteError) {
      setNotice({
        message: isApiErrorStatus(deleteError, 403)
          ? 'Удалить запись может только участник, который её создал'
          : getApiErrorMessage(deleteError, 'Не удалось удалить дату первой встречи'),
        type: 'error',
      });
    }
  };

  if (mode === 'create') {
    return (
      <AnimatedPanel className="p-4 sm:p-6">
        <div className="bg-primary-neon/10 pointer-events-none absolute -left-16 -top-20 h-52 w-52 rounded-full blur-3xl" />
        <FirstDateForm
          mode="create"
          onCancel={() => setMode('view')}
          onSuccess={handleFormSuccess}
        />
      </AnimatedPanel>
    );
  }

  if (!firstDateData) {
    return (
      <EmptyFirstDate
        canCreate={isLocallyRemoved || isApiErrorStatus(error, 404)}
        notice={notice}
        onCreate={() => openForm('create')}
        onRetry={() => {
          refetch();
        }}
      />
    );
  }

  if (mode === 'edit') {
    return (
      <AnimatedPanel className="p-4 sm:p-6">
        <div className="bg-primary-neon/10 pointer-events-none absolute -left-16 -top-20 h-52 w-52 rounded-full blur-3xl" />
        <FirstDateForm
          initialValue={firstDateData}
          mode="edit"
          onCancel={() => setMode('view')}
          onSuccess={handleFormSuccess}
        />
      </AnimatedPanel>
    );
  }

  const firstDate = dayjs(firstDateData.date).startOf('day');
  const today = dayjs().startOf('day');
  const daysPassed = Math.max(0, today.diff(firstDate, 'day'));
  const progress = getTimelineProgress(firstDate, today);
  const nextMilestone = milestones.find(({ months }) =>
    today.isBefore(firstDate.add(months, 'month'), 'day'),
  );
  const description =
    typeof firstDateData.description === 'string' ? firstDateData.description : null;

  return (
    <AnimatedPanel className="min-h-52 p-4 sm:p-6">
      <div className="bg-primary-neon/10 pointer-events-none absolute -left-16 -top-20 h-52 w-52 rounded-full blur-3xl" />
      <div className="bg-cyber-cyan/5 pointer-events-none absolute -bottom-24 right-0 h-48 w-48 rounded-full blur-3xl" />

      <NoticeBanner notice={notice} />

      <div className="relative flex flex-wrap items-start justify-between gap-gap">
        <div>
          <div className="text-primary-neon mb-2 flex items-center gap-gap text-xs font-semibold uppercase tracking-[0.2em]">
            <Sparkles aria-hidden="true" className="h-4 w-4" />
            Наша история
          </div>
          <h2 className="text-text text-lg font-semibold sm:text-xl">{firstDateData.name}</h2>
          <p className="text-muted-text mt-1 text-xs">
            Всё началось {firstDate.locale('ru').format('D MMMM YYYY')}
          </p>
          {description && (
            <p className="text-muted-text mt-3 whitespace-pre-wrap text-sm leading-relaxed">
              {description}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-start justify-end gap-gap">
          <Button
            icon={<Pencil aria-hidden="true" className="h-4 w-4" />}
            onClick={() => openForm('edit')}
            size="s"
          >
            <span>Изменить</span>
          </Button>
          <Button
            className="border-neon-pink/60 text-neon-pink hover:bg-neon-pink/10"
            icon={<Trash2 aria-hidden="true" className="h-4 w-4" />}
            onClick={() => {
              setNotice(null);
              setIsConfirmingDelete(true);
            }}
            size="s"
          >
            <span>Удалить</span>
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isConfirmingDelete && (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="border-neon-pink/35 bg-neon-pink/5 relative mt-5 rounded-2xl border p-4"
            exit={{ opacity: 0, y: -8 }}
            initial={{ opacity: 0, y: -8 }}
          >
            <div className="flex gap-gap">
              <AlertTriangle
                aria-hidden="true"
                className="text-neon-pink mt-0.5 h-5 w-5 shrink-0"
              />
              <div>
                <h3 className="text-text text-sm font-semibold">Удалить первую встречу?</h3>
                <p className="text-muted-text mt-1 text-xs leading-relaxed">
                  Это действие нельзя отменить. Backend разрешает удаление только участнику,
                  создавшему запись — {firstDateData.createdBy.firstName}{' '}
                  {firstDateData.createdBy.lastName}.
                </p>
                <div className="mt-3 flex flex-wrap gap-gap">
                  <Button
                    className="border-neon-pink/70 text-neon-pink hover:bg-neon-pink/10"
                    disabled={removeState.isLoading}
                    icon={<Trash2 aria-hidden="true" className="h-4 w-4" />}
                    onClick={handleDelete}
                    size="s"
                  >
                    <span>{removeState.isLoading ? 'Удаляем…' : 'Да, удалить'}</span>
                  </Button>
                  <Button
                    disabled={removeState.isLoading}
                    icon={<X aria-hidden="true" className="h-4 w-4" />}
                    onClick={() => setIsConfirmingDelete(false)}
                    size="s"
                  >
                    <span>Отмена</span>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative mt-6 flex justify-end">
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="border-primary-neon/35 bg-primary-neon/10 rounded-2xl border px-4 py-3 text-right shadow-[inset_0_0_18px_rgba(176,38,255,0.08)]"
          initial={{ opacity: 0, scale: 0.9 }}
          transition={{ damping: 18, stiffness: 220, type: 'spring' }}
        >
          <strong className="text-text block text-3xl leading-none tabular-nums sm:text-4xl">
            {daysPassed.toLocaleString('ru-RU')}
          </strong>
          <span className="text-muted-text text-xs">дней вместе</span>
        </motion.div>
      </div>

      <div className="relative mt-8 pb-1 pt-3">
        <div className="bg-border absolute left-0 right-0 top-3 h-1 rounded-full" />
        <motion.div
          animate={{ width: `${progress}%` }}
          className="from-electric-purple via-primary-neon to-neon-pink absolute left-0 top-3 h-1 rounded-full bg-gradient-to-r shadow-[0_0_14px_rgba(176,38,255,0.8)]"
          initial={{ width: 0 }}
          transition={{ damping: 24, stiffness: 80, type: 'spring' }}
        />
        <motion.span
          animate={{ left: `${progress}%` }}
          className="bg-text border-primary-neon absolute top-1.5 z-10 h-4 w-4 -translate-x-1/2 rounded-full border-2 shadow-[0_0_18px_rgba(176,38,255,0.95)]"
          initial={{ left: 0 }}
          transition={{ damping: 24, stiffness: 80, type: 'spring' }}
        />

        <div className="relative grid grid-cols-7">
          {milestones.map(({ label, months }) => {
            const isReached = !today.isBefore(firstDate.add(months, 'month'), 'day');

            return (
              <div className="flex min-w-0 flex-col items-end" key={months}>
                <span
                  className={`z-10 h-2.5 w-2.5 translate-x-1/2 rounded-full border transition-colors ${
                    isReached
                      ? 'border-primary-neon bg-primary-neon shadow-[0_0_10px_rgba(176,38,255,0.8)]'
                      : 'border-muted-text/45 bg-elevated'
                  }`}
                />
                <span
                  className={`mt-3 translate-x-1/2 text-center text-[9px] leading-tight sm:text-[10px] ${
                    isReached ? 'text-text' : 'text-muted-text'
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-muted-text relative mt-4 flex items-center gap-2.5 text-xs">
        <CheckCircle2 aria-hidden="true" className="text-acid-green h-3.5 w-3.5" />
        {nextMilestone
          ? `Следующая важная дата — ${firstDate
              .add(nextMilestone.months, 'month')
              .locale('ru')
              .format('D MMMM YYYY')}`
          : 'Тридцать лет — и это только начало'}
      </p>
    </AnimatedPanel>
  );
};
