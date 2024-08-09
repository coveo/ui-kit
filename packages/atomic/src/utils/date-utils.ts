import {API_DATE_FORMAT} from '@coveo/headless';
import dayjs, {ConfigType} from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export function parseDate(date: ConfigType, format?: string) {
  const parsedDate = dayjs(date, format);
  if (!parsedDate.isValid() && !format) {
    return dayjs(date, API_DATE_FORMAT);
  }
  return parsedDate;
}

/**
 * Transforms a timestamp to a date details object.
 * @param timestamp Number
 * @returns {year: number, month: string, dayOfWeek: string, day: number, hours: number,minutes: number}
 */
export function parseTimestampToDateDetails(timestamp: number) {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const date = new Date(Number(timestamp) * 1000);

  const dayOfWeek = daysOfWeek[date.getUTCDay()];
  const month = months[date.getUTCMonth()];
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();

  return {
    year,
    month,
    dayOfWeek,
    day,
    hours,
    minutes,
  };
}
