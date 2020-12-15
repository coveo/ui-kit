import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import {DateRangeRequest} from '../../../../features/facets/range-facets/date-facet-set/interfaces/request';

dayjs.extend(utc);
dayjs.extend(customParseFormat);

type DateType = string | number | Date;

type DateOptions = {
  useLocalTime?: boolean;
  dateFormat?: string;
};

type DateRangeOptions = Partial<Omit<DateRangeRequest, 'start' | 'end'>> &
  DateOptions & {
    start: DateType;
    end: DateType;
  };

export function isSearchApiDate(date: string) {
  return formatForSearchApi(dayjs(date)) === date;
}

export function buildDateRange(config: DateRangeOptions): DateRangeRequest {
  const start = buildDate(config.start, config);
  const end = buildDate(config.end, config);

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

function buildDate(rawDate: DateType, options: DateOptions) {
  const {dateFormat, useLocalTime} = options;
  const date = dayjs(rawDate, dateFormat);
  const adjusted = useLocalTime ? date : date.utc();
  return formatForSearchApi(adjusted);
}

function formatForSearchApi(date: dayjs.Dayjs) {
  const DATE_FORMAT = 'YYYY/MM/DD@HH:mm:ss';
  return date.format(DATE_FORMAT);
}
