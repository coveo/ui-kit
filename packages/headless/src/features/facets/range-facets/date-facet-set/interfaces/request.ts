import {BaseRangeFacetRequest} from '../../generic/interfaces/request';
import {CurrentValues, Type} from '../../../facet-api/request';
import {FacetValueState} from '../../../facet-api/value';
import {AnyFacetRequest} from '../../../generic/interfaces/generic-facet-request';

/**
 * The options defining a value to display in a `DateFacet`.
 */
export interface DateRangeRequest {
  /**
   * The start value of the range, formatted as `YYYY/MM/DD@HH:mm:ss` or the Relative date format TODO: describe...
   */
  start: string;

  /**
   * The end value of the range, formatted as `YYYY/MM/DD@HH:mm:ss` or the Relative date format TODO: describe...
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
