import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

const API_DATE_FORMAT = 'YYYY/MM/DD@HH:mm:ss';

export function formatDateForSearchApi(date: dayjs.Dayjs) {
  if (!date.isValid()) {
    throw new Error('Date object is invalid.');
  }

  if (date.isBefore('1401-01-01')) {
    throw new Error(
      'Date is before year 1401, which is unsupported by the index.'
    );
  }

  return date.format(API_DATE_FORMAT);
}

export function isSearchApiDate(date: string) {
  try {
    return formatDateForSearchApi(dayjs(date)) === date;
  } catch (error) {
    return false;
  }
}
