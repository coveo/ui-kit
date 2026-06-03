import {
  type AbsoluteDate,
  formatDateForSearchApi,
  parseDate,
  validateAbsoluteDate,
} from '../../../../../api/search/date/date-format.js';
import {
  isRelativeDate,
  isRelativeDateFormat,
  type RelativeDate,
  serializeRelativeDate,
  validateRelativeDate,
} from '../../../../../api/search/date/relative-date.js';
import type {FacetValueState} from '../../../../../features/facets/facet-api/value.js';
import type {DateRangeRequest} from '../../../../../features/facets/range-facets/date-facet-set/interfaces/request.js';

export type DateRangeInput = AbsoluteDate | RelativeDate;

export interface DateRangeOptions {
  /**
   * The starting value for the date range. A date range can be either absolute or [relative](https://docs.coveo.com/en/headless/latest/reference/documents/Search.DateFacet.relative-date-format.html).
   */
  start: DateRangeInput;

  /**
   * The ending value for the date range. A date range can be either absolute or [relative](https://docs.coveo.com/en/headless/latest/reference/documents/Search.DateFacet.relative-date-format.html).
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
}

/**
 * Creates a `DateRangeRequest`.
 *
 * @param config - The options with which to create a `DateRangeRequest`.
 * @returns A new `DateRangeRequest`.
 */
export function buildDateRange(config: DateRangeOptions): DateRangeRequest {
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
    validateRelativeDate(rawDate);
    return serializeRelativeDate(rawDate);
  }

  if (typeof rawDate === 'string' && isRelativeDateFormat(rawDate)) {
    validateRelativeDate(rawDate);
    return rawDate;
  }

  validateAbsoluteDate(rawDate, dateFormat);
  return formatDateForSearchApi(parseDate(rawDate, dateFormat));
}
