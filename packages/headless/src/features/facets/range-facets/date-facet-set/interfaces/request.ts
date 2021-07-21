import {BaseRangeFacetRequest} from '../../generic/interfaces/request';
import {CurrentValues, Type} from '../../../facet-api/request';
import {FacetValueState} from '../../../facet-api/value';
import {RelativeDate} from '../../../../relative-date-set/relative-date';

/**
 * The options defining a value to display in a `DateFacet`.
 */
export interface DateRangeRequest<R extends RelativeDate = RelativeDate> {
  /**
   * The start value of the range.
   * Either an absolute date, formatted as `YYYY/MM/DD@HH:mm:ss`, or a relative date object.
   */
  start: string | R;

  /**
   * The end value of the range.
   * Either an absolute date, formatted as `YYYY/MM/DD@HH:mm:ss`, or a relative date object.
   */
  end: string | R;

  /**
   * Whether to include the `end` value in the range.
   */
  endInclusive: boolean;

  /**
   * The current facet value state.
   */
  state: FacetValueState;
}

export interface DateRangeApiRequest {
  start: string;
  end: string;
  endInclusive: boolean;
  state: FacetValueState;
}

export interface DateFacetRequest
  extends BaseRangeFacetRequest,
    CurrentValues<DateRangeApiRequest>,
    Type<'dateRange'> {}
