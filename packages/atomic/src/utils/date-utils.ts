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
