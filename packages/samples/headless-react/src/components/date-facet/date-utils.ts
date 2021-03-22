import {buildDateRange} from '@coveo/headless';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export const dateRanges = [
  buildDateRange({
    start: new Date(1970, 1),
    end: new Date(1990, 1),
  }),
  buildDateRange({
    start: new Date(1990, 1),
    end: new Date(2005, 1),
  }),
  buildDateRange({
    start: new Date(2005, 1),
    end: new Date(2010, 1),
  }),
  buildDateRange({
    start: new Date(2010, 1),
    end: new Date(2015, 1),
  }),
  buildDateRange({
    start: new Date(2015, 1),
    end: new Date(2018, 1),
  }),
  buildDateRange({
    start: new Date(2018, 1),
    end: new Date(2020, 1),
  }),
  buildDateRange({
    start: new Date(2020, 1),
    end: new Date(2021, 1),
  }),
];

export function parseDate(date: string) {
  return dayjs(date, 'YYYY/MM/DD@HH:mm:ss');
}
