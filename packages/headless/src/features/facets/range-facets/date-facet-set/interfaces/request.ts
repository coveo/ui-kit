import type {CurrentValues, Type} from '../../../facet-api/request.js';
import type {FacetValueState} from '../../../facet-api/value.js';
import type {AnyFacetRequest} from '../../../generic/interfaces/generic-facet-request.js';
import type {BaseRangeFacetRequest} from '../../generic/interfaces/request.js';

/**
 * The options defining a value to display in a `DateFacet`.
 */
export interface DateRangeRequest {
  /**
   * The starting value for the date range, formatted as `YYYY/MM/DD@HH:mm:ss` or the [Relative Date](https://docs.coveo.com/en/headless/latest/reference/documents/Search.DateFacet.relative-date-format.html) format "period-amount-unit".
   */
  start: string;

  /**
   * The ending value for the date range, formatted as `YYYY/MM/DD@HH:mm:ss` or the [Relative Date](https://docs.coveo.com/en/headless/latest/reference/documents/Search.DateFacet.relative-date-format.html) format "period-amount-unit".
   */
  end: string;

  /**
   * Whether to include the `end` value in the range.
   */
  endInclusive: boolean;

  /**
   * The current facet value state.
   */
  state: FacetValueState;

  /**
   * The previous facet value state in the search interface.
   */
  previousState?: FacetValueState;
}

export function isDateFacetRequest(
  request: AnyFacetRequest
): request is DateFacetRequest {
  return request.type === 'dateRange';
}

export interface DateFacetRequest
  extends BaseRangeFacetRequest,
    CurrentValues<DateRangeRequest>,
    Type<'dateRange'> {}
