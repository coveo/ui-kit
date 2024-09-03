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
 * Parses a given timestamp into detailed date components.
 *
 * @function
 * @param {number} timestamp - The timestamp in milliseconds since January 1, 1970 (epoch time).
 * @returns {Object} An object containing the following date details:
 *   - {number} year - The four-digit year (e.g., 2024).
 *   - {string} month - The full name of the month (e.g., "August").
 *   - {string} dayOfWeek - The abbreviated name of the day of the week (e.g., "Mon").
 *   - {number} day - The day of the month (e.g., 26).
 *   - {number} hours - The hour of the day in 24-hour format (0-23).
 *   - {number} minutes - The minutes of the hour (0-59).
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

  const date = new Date(timestamp);

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
