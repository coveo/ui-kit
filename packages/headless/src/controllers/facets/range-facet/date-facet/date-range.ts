import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import {FacetValueState} from '../../../../features/facets/facet-api/value';
import {formatDateForSearchApi} from '../../../../api/date-format';
import {RelativeDate} from '../../../../features/relative-date-set/relative-date';
import {DateRangeRequest} from '../../../../features/facets/range-facets/date-facet-set/interfaces/request';

dayjs.extend(utc);

export type DateRangeInput = string | number | Date | RelativeDate;

export interface DateRangeOptions {
  /**
   * The start value of the range.
   */
  start: DateRangeInput;

  /**
   * The end value of the range.
   */
  end: DateRangeInput;

  /**
   * Whether to include the end value in the range.
   *
   * @defaultValue `false`
   */
  endInclusive?: boolean;

  /**
   * The current facet value state.
   *
   * @defaultValue `idle`
   */
  state?: FacetValueState;

  /**
   * Allows specifying a custom string date format. See [Day.js](https://day.js.org/docs/en/parse/string-format#list-of-all-available-parsing-tokens) for possible parsing tokens. Assumes [ISO 8601](https://day.js.org/docs/en/parse/string) format by default.
   */
  dateFormat?: string;

  /**
   * If `true`, the date will be returned unshifted. If `false`, the date will be adjusted to UTC time.
   *
   * @defaultValue `false`
   */
  useLocalTime?: boolean;
}

function isRelativeDate(rawDate: DateRangeInput): rawDate is RelativeDate {
  return (
    typeof rawDate !== 'number' &&
    typeof rawDate !== 'string' &&
    !(rawDate instanceof Date)
  );
}

/**
 * Creates a `DateRangeRequest`.
 *
 * @param config - The options with which to create a `DateRangeRequest`.
 * @returns A new `DateRangeRequest`.
 */
export function buildDateRange(config: DateRangeOptions): DateRangeRequest {
  const start = isRelativeDate(config.start)
    ? config.start
    : buildDate(config.start, config);
  const end = isRelativeDate(config.end)
    ? config.end
    : buildDate(config.end, config);
  const endInclusive = config.endInclusive ?? false;
  const state = config.state ?? 'idle';

  return {
    start,
    end,
    endInclusive,
    state,
  };
}

function buildDate(rawDate: string | number | Date, options: DateRangeOptions) {
  const {dateFormat, useLocalTime} = options;
  const date = dayjs(rawDate, dateFormat);

  if (!date.isValid()) {
    throw new Error(
      `Could not parse the provided date "${rawDate}".
      Please provide a dateFormat string in the configuration options.
      See https://day.js.org/docs/en/parse/string-format for more information.
       `
    );
  }

  const adjusted = useLocalTime ? date : date.utc();
  return formatDateForSearchApi(adjusted);
}
