import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import {DateRangeRequest} from '../../../../features/facets/range-facets/date-facet-set/interfaces/request';

dayjs.extend(utc);
dayjs.extend(customParseFormat);

type DateRangeOptions = Partial<Omit<DateRangeRequest, 'start' | 'end'>> & {
  start: string | number | Date;
  end: string | number | Date;
  useLocalTime?: boolean;
  dateFormat?: string;
};

export function buildDateRange(config: DateRangeOptions): DateRangeRequest {
  const DATE_FORMAT = 'YYYY/MM/DD@HH:mm:ss';
  const start = config.useLocalTime
    ? dayjs(config.start, config.dateFormat).format(DATE_FORMAT)
    : dayjs(config.start, config.dateFormat).utc().format(DATE_FORMAT);
  const end = config.useLocalTime
    ? dayjs(config.end, config.dateFormat).format(DATE_FORMAT)
    : dayjs(config.end, config.dateFormat).utc().format(DATE_FORMAT);

  if (start === 'Invalid Date' || end === 'Invalid Date') {
    throw new Error(
      `Could not parse the provided date, please provide a dateFormat string in the configuration options.\n
       See https://day.js.org/docs/en/parse/string-format for more information.
       `
    );
  }

  const endInclusive = config.endInclusive ?? false;
  const state = config.state ?? 'idle';

  return {
    start,
    end,
    endInclusive,
    state,
  };
}
