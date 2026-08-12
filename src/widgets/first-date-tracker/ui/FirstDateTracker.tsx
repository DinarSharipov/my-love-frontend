import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { Heart, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

import { useFindMyFirstDateQuery } from '@/shared/api';

const milestones = [
  { label: '1 месяц', months: 1 },
  { label: '6 месяцев', months: 6 },
  { label: '1 год', months: 12 },
  { label: '5 лет', months: 60 },
  { label: '10 лет', months: 120 },
  { label: '20 лет', months: 240 },
  { label: '30 лет', months: 360 },
] as const;

const isNotFoundError = (error: unknown) =>
  typeof error === 'object' && error !== null && 'status' in error && error.status === 404;

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
  <div className="border-border bg-surface/65 relative min-h-52 overflow-hidden rounded-3xl border p-5 backdrop-blur-xl">
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

export const FirstDateTracker = () => {
  const { data, error, isLoading } = useFindMyFirstDateQuery();

  if (isLoading) return <TrackerSkeleton />;

  if (!data) {
    return (
      <section className="border-border bg-surface/70 relative grid min-h-52 place-items-center overflow-hidden rounded-3xl border p-6 text-center backdrop-blur-xl">
        <div className="bg-primary-neon/10 absolute h-36 w-36 rounded-full blur-3xl" />
        <div className="relative">
          <Heart className="text-primary-neon mx-auto mb-3 h-8 w-8" strokeWidth={1.5} />
          <p className="text-text text-sm font-medium">
            {isNotFoundError(error)
              ? 'Дата первой встречи пока не добавлена'
              : 'Не удалось загрузить историю вашей встречи'}
          </p>
          <p className="text-muted-text mt-1 text-xs">Здесь появится ваш общий путь во времени</p>
        </div>
      </section>
    );
  }

  const firstDate = dayjs(data.date).startOf('day');
  const today = dayjs().startOf('day');
  const daysPassed = Math.max(0, today.diff(firstDate, 'day'));
  const progress = getTimelineProgress(firstDate, today);
  const nextMilestone = milestones.find(({ months }) =>
    today.isBefore(firstDate.add(months, 'month'), 'day'),
  );

  return (
    <section className="border-border bg-surface/70 relative min-h-52 overflow-hidden rounded-3xl border p-4 shadow-[0_0_45px_rgba(176,38,255,0.1)] backdrop-blur-xl sm:p-6">
      <div className="bg-primary-neon/10 pointer-events-none absolute -left-16 -top-20 h-52 w-52 rounded-full blur-3xl" />
      <div className="bg-cyber-cyan/5 pointer-events-none absolute -bottom-24 right-0 h-48 w-48 rounded-full blur-3xl" />

      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-primary-neon mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
            <Sparkles className="h-4 w-4" />
            Наша история
          </div>
          <h2 className="text-text text-lg font-semibold sm:text-xl">{data.name}</h2>
          <p className="text-muted-text mt-1 text-xs">
            Всё началось {firstDate.locale('ru').format('D MMMM YYYY')}
          </p>
        </div>

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

      <p className="text-muted-text relative mt-4 text-xs">
        {nextMilestone
          ? `Следующая важная дата — ${firstDate
              .add(nextMilestone.months, 'month')
              .locale('ru')
              .format('D MMMM YYYY')}`
          : 'Тридцать лет — и это только начало'}
      </p>
    </section>
  );
};
