import {BaseRangeFacetRequest} from '../../generic/interfaces/request';
import {CurrentValues, Type} from '../../../facet-api/request';
import {FacetValueState} from '../../../facet-api/value';

/**
 * The options defining a value to display in a `DateFacet`.
 */
export interface DateRangeRequest {
  /**
   * The start value of the range, formatted as YYYY/MM/DD@HH:mm:ss.
   */
  start: string;

  /**
   * The end value of the range, formatted as YYYY/MM/DD@HH:mm:ss.
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

export interface DateFacetRequest
  extends BaseRangeFacetRequest,
    CurrentValues<DateRangeRequest>,
    Type<'dateRange'> {}
