import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

export function formatDateForSearchApi(date: dayjs.Dayjs) {
  const DATE_FORMAT = 'YYYY/MM/DD@HH:mm:ss';
  return date.format(DATE_FORMAT);
}

export function isSearchApiDate(date: string) {
  return formatDateForSearchApi(dayjs(date)) === date;
}
