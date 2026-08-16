import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';

export type PlannedItem = {
  readonly date: Date;
  readonly id: number | string;
  readonly name: string;
};

export type CalendarPeriod = {
  readonly from: Date;
  readonly to: Date;
};

export type CalendarVisiblePeriod = {
  readonly from: Date;
  readonly toExclusive: Date;
};

type CalendarProps = {
  className?: string;
  onChangePeriod?: (period: CalendarPeriod) => void;
  onClickDay?: (day: Date, item?: PlannedItem) => void;
  onVisiblePeriodChange?: (period: CalendarVisiblePeriod) => void;
  plannedItems?: readonly PlannedItem[];
  selectionMode?: 'range' | 'single';
  selectedPeriod?: CalendarPeriod;
  timeZone?: string;
};

const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const;
const visibleDaysCount = 42;
const yearsPerPage = 12;

dayjs.extend(utc);
dayjs.extend(timezone);

const copyDate = (date: Date) => new Date(date.getTime());

const normalizePeriod = (from: Date, to: Date): CalendarPeriod => {
  const normalizedFrom = dayjs(from).startOf('day');
  const normalizedTo = dayjs(to).startOf('day');

  return normalizedFrom.isBefore(normalizedTo) || normalizedFrom.isSame(normalizedTo)
    ? { from: normalizedFrom.toDate(), to: normalizedTo.toDate() }
    : { from: normalizedTo.toDate(), to: normalizedFrom.toDate() };
};

const getMonthTitle = (date: dayjs.Dayjs) => {
  const title = date.locale('ru').format('MMMM YYYY');

  return `${title.charAt(0).toLocaleUpperCase('ru')}${title.slice(1)}`;
};

const getDayNumberClassName = ({
  isCurrentMonth,
  isPeriodEdge,
  isToday,
}: {
  isCurrentMonth: boolean;
  isPeriodEdge: boolean;
  isToday: boolean;
}) => {
  if (isPeriodEdge) {
    return 'bg-primary-neon text-text shadow-[0_0_14px_color-mix(in_srgb,var(--color-primary-neon)_65%,transparent)]';
  }

  if (isToday) {
    return 'bg-cyber-cyan text-background shadow-[0_0_14px_color-mix(in_srgb,var(--color-cyber-cyan)_70%,transparent)]';
  }

  return isCurrentMonth ? 'text-text' : 'text-muted-text/45';
};

const getRangeHighlightClassName = ({
  isRangeEnd,
  isRangeStart,
  isWeekEnd,
  isWeekStart,
}: {
  isRangeEnd: boolean;
  isRangeStart: boolean;
  isWeekEnd: boolean;
  isWeekStart: boolean;
}) => {
  let className =
    'pointer-events-none absolute inset-y-[12%] border-y border-primary-neon/25 bg-gradient-to-r from-electric-purple/20 via-primary-neon/25 to-electric-purple/20';

  className += isRangeStart || isWeekStart ? ' left-0.5 rounded-l-lg' : ' left-0';
  className += isRangeEnd || isWeekEnd ? ' right-0.5 rounded-r-lg' : ' right-0';

  if (isRangeStart || isRangeEnd) {
    className +=
      ' border-primary-neon/55 shadow-[inset_0_0_16px_color-mix(in_srgb,var(--color-primary-neon)_22%,transparent),0_0_12px_color-mix(in_srgb,var(--color-primary-neon)_16%,transparent)]';
  }

  return className;
};

export const Calendar = ({
  className = '',
  onChangePeriod,
  onClickDay,
  onVisiblePeriodChange,
  plannedItems = [],
  selectionMode = 'range',
  selectedPeriod,
  timeZone,
}: CalendarProps) => {
  const initialDate = selectedPeriod?.from ?? new Date();
  const [visibleMonth, setVisibleMonth] = useState(() => dayjs(initialDate).startOf('month'));
  const [draftPeriod, setDraftPeriod] = useState<CalendarPeriod | undefined>(() =>
    selectedPeriod ? normalizePeriod(selectedPeriod.from, selectedPeriod.to) : undefined,
  );
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);
  const [yearPageStart, setYearPageStart] = useState(
    () => Math.floor(dayjs(initialDate).year() / yearsPerPage) * yearsPerPage,
  );
  const selectedFromTimestamp = selectedPeriod?.from.getTime();
  const selectedToTimestamp = selectedPeriod?.to.getTime();
  const activePeriod = draftPeriod;

  useEffect(() => {
    if (selectedFromTimestamp === undefined || selectedToTimestamp === undefined) {
      setDraftPeriod(undefined);
      setRangeStart(null);
      return;
    }

    setDraftPeriod(normalizePeriod(new Date(selectedFromTimestamp), new Date(selectedToTimestamp)));
    setRangeStart(null);
  }, [selectedFromTimestamp, selectedToTimestamp]);

  const calendarDays = useMemo(() => {
    const monthStart = visibleMonth.startOf('month');
    const mondayOffset = (monthStart.day() + 6) % 7;
    const gridStart = monthStart.subtract(mondayOffset, 'day');

    return Array.from({ length: visibleDaysCount }, (_, index) => gridStart.add(index, 'day'));
  }, [visibleMonth]);
  const visibleFromTimestamp = calendarDays[0].valueOf();
  const visibleToTimestamp = calendarDays[calendarDays.length - 1].add(1, 'day').valueOf();

  useEffect(() => {
    onVisiblePeriodChange?.({
      from: new Date(visibleFromTimestamp),
      toExclusive: new Date(visibleToTimestamp),
    });
  }, [onVisiblePeriodChange, visibleFromTimestamp, visibleToTimestamp]);

  const itemsByDay = useMemo(() => {
    const result = new Map<string, PlannedItem[]>();

    plannedItems
      .filter((item) => dayjs(item.date).isValid())
      .slice()
      .sort((left, right) => left.date.getTime() - right.date.getTime())
      .forEach((item) => {
        const itemDate = timeZone ? dayjs(item.date).tz(timeZone) : dayjs(item.date);
        const dateKey = itemDate.format('YYYY-MM-DD');
        const items = result.get(dateKey) ?? [];

        items.push(item);
        result.set(dateKey, items);
      });

    return result;
  }, [plannedItems, timeZone]);

  const visibleYears = useMemo(
    () => Array.from({ length: yearsPerPage }, (_, index) => yearPageStart + index),
    [yearPageStart],
  );
  const periodLabel = useMemo(() => {
    if (!activePeriod) {
      return 'Выберите начало и конец периода';
    }

    if (rangeStart) {
      return `Начало: ${dayjs(activePeriod.from).locale('ru').format('D MMMM YYYY')} · выберите конец`;
    }

    const from = dayjs(activePeriod.from).locale('ru');
    const to = dayjs(activePeriod.to).locale('ru');
    const includeYear = from.year() !== to.year();
    const fromFormat = includeYear ? 'D MMMM YYYY' : 'D MMMM';

    return `${from.format(fromFormat)} — ${to.format('D MMMM YYYY')}`;
  }, [activePeriod, rangeStart]);

  const selectDay = (day: dayjs.Dayjs) => {
    const normalizedDay = day.startOf('day').toDate();

    onClickDay?.(copyDate(normalizedDay));

    if (selectionMode === 'single') {
      const nextPeriod = { from: normalizedDay, to: normalizedDay };

      setDraftPeriod(nextPeriod);
      setRangeStart(null);
      onChangePeriod?.({ from: copyDate(normalizedDay), to: copyDate(normalizedDay) });
      return;
    }

    if (!rangeStart) {
      setRangeStart(normalizedDay);
      setDraftPeriod({ from: normalizedDay, to: normalizedDay });
      return;
    }

    const nextPeriod = normalizePeriod(rangeStart, normalizedDay);

    setDraftPeriod(nextPeriod);
    setRangeStart(null);
    onChangePeriod?.({ from: copyDate(nextPeriod.from), to: copyDate(nextPeriod.to) });
  };

  const openItem = (day: dayjs.Dayjs, item: PlannedItem) => {
    onClickDay?.(day.startOf('day').toDate(), item);
  };

  const handleDayKeyDown = (event: KeyboardEvent<HTMLDivElement>, day: dayjs.Dayjs) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    selectDay(day);
  };

  const handleItemClick = (
    event: MouseEvent<HTMLButtonElement>,
    day: dayjs.Dayjs,
    item: PlannedItem,
  ) => {
    event.stopPropagation();
    openItem(day, item);
  };

  const openYearPicker = () => {
    setYearPageStart(Math.floor(visibleMonth.year() / yearsPerPage) * yearsPerPage);
    setIsYearPickerOpen((isOpen) => !isOpen);
  };

  const selectYear = (year: number) => {
    setVisibleMonth((currentMonth) => currentMonth.year(year));
    setIsYearPickerOpen(false);
  };

  return (
    <section
      aria-label="Календарь мероприятий"
      className={`border-border bg-surface/75 text-text flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border shadow-[0_0_48px_color-mix(in_srgb,var(--color-primary-neon)_12%,transparent)] backdrop-blur-xl sm:rounded-3xl ${className}`}
    >
      <header className="border-border/80 relative z-30 flex shrink-0 items-center justify-between gap-gap border-b px-2 py-2 sm:px-5 sm:py-3">
        <motion.button
          aria-label="Предыдущий месяц"
          className="border-border bg-elevated/70 text-muted-text hover:border-primary-neon/70 hover:text-text focus-visible:border-cyber-cyan grid size-9 cursor-pointer place-items-center rounded-xl border outline-none sm:size-10"
          onClick={() => setVisibleMonth((currentMonth) => currentMonth.subtract(1, 'month'))}
          type="button"
          whileHover={{ scale: 1.06, x: -2 }}
          whileTap={{ scale: 0.92 }}
        >
          <ChevronLeft aria-hidden="true" className="size-4 sm:size-5" />
        </motion.button>

        <div className="relative min-w-0">
          <motion.button
            aria-expanded={isYearPickerOpen}
            aria-haspopup="listbox"
            className="hover:text-primary-neon focus-visible:text-cyber-cyan flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1 text-sm font-semibold tracking-wide outline-none sm:text-lg"
            onClick={openYearPicker}
            type="button"
            whileTap={{ scale: 0.97 }}
          >
            <motion.span
              key={visibleMonth.format('YYYY-MM')}
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: -5 }}
            >
              {getMonthTitle(visibleMonth)}
            </motion.span>
            <motion.span animate={{ rotate: isYearPickerOpen ? 180 : 0 }}>
              <ChevronDown aria-hidden="true" className="size-3.5 sm:size-4" />
            </motion.span>
          </motion.button>

          <AnimatePresence>
            {isYearPickerOpen && (
              <motion.div
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="border-primary-neon/50 bg-elevated/95 absolute left-1/2 top-[calc(100%+10px)] z-50 w-64 -translate-x-1/2 rounded-2xl border p-3 shadow-[0_0_35px_color-mix(in_srgb,var(--color-primary-neon)_30%,transparent)] backdrop-blur-2xl"
                exit={{ opacity: 0, scale: 0.96, y: -6 }}
                initial={{ opacity: 0, scale: 0.96, y: -6 }}
                role="listbox"
                transition={{ duration: 0.18 }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <button
                    aria-label="Предыдущие годы"
                    className="text-muted-text hover:text-primary-neon cursor-pointer rounded-lg p-1 outline-none focus-visible:text-cyber-cyan"
                    onClick={() => setYearPageStart((year) => year - yearsPerPage)}
                    type="button"
                  >
                    <ChevronLeft aria-hidden="true" className="size-4" />
                  </button>
                  <span className="text-muted-text text-xs">
                    {yearPageStart} — {yearPageStart + yearsPerPage - 1}
                  </span>
                  <button
                    aria-label="Следующие годы"
                    className="text-muted-text hover:text-primary-neon cursor-pointer rounded-lg p-1 outline-none focus-visible:text-cyber-cyan"
                    onClick={() => setYearPageStart((year) => year + yearsPerPage)}
                    type="button"
                  >
                    <ChevronRight aria-hidden="true" className="size-4" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-gap">
                  {visibleYears.map((year) => {
                    const isSelectedYear = year === visibleMonth.year();

                    return (
                      <motion.button
                        aria-selected={isSelectedYear}
                        className={`cursor-pointer rounded-lg px-2 py-2 text-xs outline-none transition-colors sm:text-sm ${
                          isSelectedYear
                            ? 'bg-primary-neon/20 text-primary-neon shadow-[inset_0_0_12px_color-mix(in_srgb,var(--color-primary-neon)_22%,transparent)]'
                            : 'text-muted-text hover:bg-electric-purple/15 hover:text-text focus-visible:text-cyber-cyan'
                        }`}
                        key={year}
                        onClick={() => selectYear(year)}
                        role="option"
                        type="button"
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {year}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          aria-label="Следующий месяц"
          className="border-border bg-elevated/70 text-muted-text hover:border-primary-neon/70 hover:text-text focus-visible:border-cyber-cyan grid size-9 cursor-pointer place-items-center rounded-xl border outline-none sm:size-10"
          onClick={() => setVisibleMonth((currentMonth) => currentMonth.add(1, 'month'))}
          type="button"
          whileHover={{ scale: 1.06, x: 2 }}
          whileTap={{ scale: 0.92 }}
        >
          <ChevronRight aria-hidden="true" className="size-4 sm:size-5" />
        </motion.button>
      </header>

      <div className="grid shrink-0 grid-cols-7 px-1 pt-1 sm:px-3 sm:pt-2" role="row">
        {weekdays.map((weekday, index) => (
          <div
            className={`py-1 text-center text-[9px] font-semibold uppercase tracking-[0.14em] sm:py-1.5 sm:text-xs ${
              index > 4 ? 'text-primary-neon/75' : 'text-muted-text'
            }`}
            key={weekday}
            role="columnheader"
          >
            {weekday}
          </div>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-6 gap-px bg-border/50" role="grid">
        {calendarDays.map((day) => {
          const dateKey = day.format('YYYY-MM-DD');
          const dayItems = itemsByDay.get(dateKey) ?? [];
          const isCurrentMonth = day.month() === visibleMonth.month();
          const today = timeZone ? dayjs().tz(timeZone) : dayjs();
          const isToday = day.isSame(today, 'day');
          const isRangeStart = Boolean(activePeriod && day.isSame(activePeriod.from, 'day'));
          const isRangeEnd = Boolean(activePeriod && day.isSame(activePeriod.to, 'day'));
          const isInRange = Boolean(
            activePeriod &&
            !day.isBefore(activePeriod.from, 'day') &&
            !day.isAfter(activePeriod.to, 'day'),
          );
          const hiddenItemsCount = Math.max(dayItems.length - 2, 0);
          const rangeHighlightClassName = getRangeHighlightClassName({
            isRangeEnd,
            isRangeStart,
            isWeekEnd: day.day() === 0,
            isWeekStart: day.day() === 1,
          });
          const dayNumberClassName = getDayNumberClassName({
            isCurrentMonth,
            isPeriodEdge: isRangeStart || isRangeEnd,
            isToday,
          });

          return (
            <motion.div
              aria-label={`Выбрать ${day.locale('ru').format('D MMMM YYYY')}`}
              aria-selected={isInRange}
              className={`group relative min-h-0 min-w-0 cursor-pointer overflow-hidden p-0.5 transition-colors focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-cyber-cyan focus-visible:outline-none sm:p-1.5 ${
                isCurrentMonth ? 'bg-surface/95' : 'bg-background/85'
              } ${isInRange ? '' : 'hover:bg-elevated'}`}
              key={dateKey}
              onClick={() => selectDay(day)}
              onKeyDown={(event) => handleDayKeyDown(event, day)}
              role="gridcell"
              tabIndex={0}
              whileHover={{ boxShadow: 'inset 0 0 20px rgba(176, 38, 255, 0.12)' }}
            >
              <AnimatePresence initial={false}>
                {isInRange && (
                  <motion.span
                    animate={{ opacity: 1, scaleY: 1 }}
                    className={rangeHighlightClassName}
                    exit={{ opacity: 0, scaleY: 0.7 }}
                    initial={{ opacity: 0, scaleY: 0.7 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  />
                )}
              </AnimatePresence>

              <div className="pointer-events-none relative flex h-full min-h-0 min-w-0 flex-col">
                <span
                  className={`mb-0.5 grid size-4 shrink-0 place-items-center rounded-full text-[9px] font-medium sm:mb-1 sm:size-6 sm:text-xs ${dayNumberClassName}`}
                >
                  {day.date()}
                </span>

                <div className="flex min-h-0 min-w-0 flex-col gap-2.5 overflow-hidden">
                  {dayItems.slice(0, 2).map((item) => (
                    <motion.button
                      aria-label={`${item.name}, ${(timeZone ? dayjs(item.date).tz(timeZone) : dayjs(item.date)).locale('ru').format('HH:mm')}`}
                      className="border-primary-neon/30 bg-primary-neon/10 text-text pointer-events-auto min-w-0 cursor-pointer truncate rounded border-l-2 px-1 py-0.5 text-left text-[8px] leading-tight outline-none hover:border-neon-pink hover:bg-primary-neon/20 focus-visible:border-cyber-cyan sm:px-1.5 sm:py-1 sm:text-[11px]"
                      key={item.id}
                      onClick={(event) => handleItemClick(event, day, item)}
                      title={`${(timeZone ? dayjs(item.date).tz(timeZone) : dayjs(item.date)).format('HH:mm')} · ${item.name}`}
                      type="button"
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-cyber-cyan mr-1 hidden font-medium sm:inline">
                        {(timeZone ? dayjs(item.date).tz(timeZone) : dayjs(item.date)).format(
                          'HH:mm',
                        )}
                      </span>
                      {item.name}
                    </motion.button>
                  ))}
                  {hiddenItemsCount > 0 && (
                    <span className="text-muted-text truncate px-1 text-[8px] sm:text-[10px]">
                      +{hiddenItemsCount} ещё
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <footer className="border-border/80 text-muted-text flex shrink-0 flex-wrap items-center justify-between gap-gap border-t px-3 py-1.5 text-[9px] sm:px-5 sm:py-2 sm:text-xs">
        <motion.span
          key={periodLabel}
          animate={{ opacity: 1, x: 0 }}
          className={activePeriod ? 'text-primary-neon' : undefined}
          initial={{ opacity: 0, x: -4 }}
        >
          {periodLabel}
        </motion.span>
        <button
          className="hover:text-cyber-cyan cursor-pointer outline-none transition-colors focus-visible:text-cyber-cyan"
          onClick={() => setVisibleMonth(dayjs().startOf('month'))}
          type="button"
        >
          Сегодня
        </button>
      </footer>
    </section>
  );
};
