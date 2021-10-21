import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

const API_DATE_FORMAT = 'YYYY/MM/DD@HH:mm:ss';
export const API_DATE_MINIMUM = '1401-01-01';

export function formatDateForSearchApi(date: dayjs.Dayjs) {
  return date.format(API_DATE_FORMAT);
}

export function isSearchApiDate(date: string) {
  return formatDateForSearchApi(dayjs(date)) === date;
}

/**
 * Validates an absolute date and throws if it is invalid.
 * @param relativeDate The relative date, either as a `RelativeDate` object or a string.
 */
export function validateAbsoluteDate(date: dayjs.Dayjs) {
  if (!date.isValid()) {
    throw new Error(`Date is invalid: ${date}`);
  }

  if (date.isBefore(API_DATE_MINIMUM)) {
    throw new Error(
      `Date is before year 1401, which is unsupported by the API: ${date}`
    );
  }
}
