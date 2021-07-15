import {DateRangeRequest} from '../../../../features/facets/range-facets/date-facet-set/interfaces/request';
import {FacetValueState} from '../../../../features/facets/facet-api/value';
import {RelativeDate} from '../../../../features';
import {
  getBoundsFromRelativeDate,
  validateRelativeDate,
} from '../../../../features/facets/range-facets/date-facet-set/relative-date';

export interface RelativeDateRangeOptions {
  /**
   * The `RelativeDate` object.
   */
  relativeDate: RelativeDate;

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
   * If `true`, the date will be returned unshifted. If `false`, the date will be adjusted to UTC time.
   *
   * @defaultValue `false`
   */
  useLocalTime?: boolean;
}

/**
 * Creates a `DateRangeRequest` from a relative date.
 *
 * @param config - The options with which to create a `DateRangeRequest`.
 * @returns A new `DateRangeRequest`.
 */
export function buildRelativeDateRange(
  config: RelativeDateRangeOptions
): DateRangeRequest {
  const {relativeDate} = config;
  validateRelativeDate(relativeDate);
  const endInclusive = config.endInclusive ?? false;
  const state = config.state ?? 'idle';

  return {
    endInclusive,
    state,
    relativeDate,
    ...getBoundsFromRelativeDate(relativeDate),
  };
}
