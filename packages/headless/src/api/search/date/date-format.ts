import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

const API_DATE_FORMAT = 'YYYY/MM/DD@HH:mm:ss';

export function formatDateForSearchApi(date: dayjs.Dayjs) {
  return date.format(API_DATE_FORMAT);
}

export function isSearchApiDate(date: string) {
  try {
    return formatDateForSearchApi(dayjs(date)) === date;
  } catch (error) {
    return false;
  }
}
