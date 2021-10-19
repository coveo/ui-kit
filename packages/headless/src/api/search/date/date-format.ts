import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import minMax from 'dayjs/plugin/minMax';

dayjs.extend(customParseFormat);
dayjs.extend(minMax);

const API_DATE_FORMAT = 'YYYY/MM/DD@HH:mm:ss';

export function formatDateForSearchApi(date: dayjs.Dayjs) {
  return dayjs.max([dayjs(new Date(0, 0, 0)), date]).format(API_DATE_FORMAT);
}

export function isSearchApiDate(date: string) {
  return formatDateForSearchApi(dayjs(date)) === date;
}
