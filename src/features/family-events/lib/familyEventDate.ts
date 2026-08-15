import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

export const getFamilyDateKey = (instant: string | Date, timeZone: string) =>
  dayjs(instant).tz(timeZone).format('YYYY-MM-DD');

export const formatFamilyEventTime = (instant: string | Date, timeZone: string) =>
  dayjs(instant).tz(timeZone).format('HH:mm');

export const toFamilyEventInstant = (date: string, time: string, timeZone: string) =>
  dayjs.tz(`${date}T${time}:00`, timeZone).toISOString();
