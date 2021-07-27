import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import {DateRangeRequest} from '../../../../features/facets/range-facets/date-facet-set/interfaces/request';
import {FacetValueState} from '../../../../features/facets/facet-api/value';
import {formatDateForSearchApi} from '../../../../api/search/date/date-format';
import {
  serializeRelativeDate,
  isRelativeDate,
  isRelativeDateFormat,
  RelativeDate,
} from '../../../../api/search/date/relative-date';
import {isUndefined} from '@coveo/bueno';

dayjs.extend(utc);
dayjs.extend(customParseFormat);

type AbsoluteDate = string | number | Date;
export type DateRangeInput = AbsoluteDate | RelativeDate;

export interface DateRangeOptions {
  /**
   * The starting value for the date range. A date range can be either absolute or relative.
   */
  start: DateRangeInput;

  /**
   * The ending value for the date range. A date range can be either absolute or relative.
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
   * @deprecated No adjusments to UTC are being made. Please use the `timezone` engine configuration option instead.
   */
  useLocalTime?: boolean;
}

/**
 * Creates a `DateRangeRequest`.
 *
 * @param config - The options with which to create a `DateRangeRequest`.
 * @returns A new `DateRangeRequest`.
 */
export function buildDateRange(config: DateRangeOptions): DateRangeRequest {
  if (!isUndefined(config.useLocalTime)) {
    console.warn(
      'The "useLocalTime" option for "buildDateRange" is deprecated. Please use the "timezone" engine configuration option instead.'
    );
  }

  const start = buildDate(config.start, config);
  const end = buildDate(config.end, config);
  const endInclusive = config.endInclusive ?? false;
  const state = config.state ?? 'idle';

  return {
    start,
    end,
    endInclusive,
    state,
  };
}

function buildDate(rawDate: DateRangeInput, options: DateRangeOptions) {
  const {dateFormat} = options;
  if (isRelativeDate(rawDate)) {
    return serializeRelativeDate(rawDate);
  }

  if (typeof rawDate === 'string' && isRelativeDateFormat(rawDate)) {
    return rawDate;
  }

  const date = dayjs(rawDate, dateFormat);

  if (!date.isValid()) {
    throw new Error(
      `Could not parse the provided date "${rawDate}".
      Please provide a dateFormat string in the configuration options.
      See https://day.js.org/docs/en/parse/string-format for more information.
       `
    );
  }

  return formatDateForSearchApi(date);
}
