import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

export const API_DATE_FORMAT = 'YYYY/MM/DD@HH:mm:ss';
const API_DATE_MINIMUM = '1401-01-01';

export type AbsoluteDate = string | number | Date;

export function formatDateForSearchApi(date: dayjs.Dayjs) {
  return date.format(API_DATE_FORMAT);
}

export function isSearchApiDate(date: string) {
  return formatDateForSearchApi(dayjs(date)) === date;
}

export function validateAbsoluteDate(date: AbsoluteDate, dateFormat?: string) {
  const dayJSDate = dayjs(date, dateFormat);

  if (!dayJSDate.isValid()) {
    const provideFormat =
      '. Please provide a date format string in the configuration options. See https://day.js.org/docs/en/parse/string-format for more information.';
    const withFormat = ` with the format "${dateFormat}""`;
    throw new Error(
      `Could not parse the provided date "${date}"${
        dateFormat ? withFormat : provideFormat
      }`
    );
  }

  assertDateAboveAPIMinimum(dayJSDate);
}

export function assertDateAboveAPIMinimum(date: dayjs.Dayjs) {
  if (date.isBefore(API_DATE_MINIMUM)) {
    throw new Error(
      `Date is before year 1401, which is unsupported by the API: ${date}`
    );
  }
}
