import {BaseRangeFacetRequest} from '../../generic/interfaces/request';
import {CurrentValues, Type} from '../../../facet-api/request';
import {FacetValueState} from '../../../facet-api/value';
import {
  RelativeDate,
  RelativeDateMap,
} from '../../../../relative-date-set/relative-date';

/**
 * The options defining a value to display in a `DateFacet`.
 */
export interface DateRangeRequest {
  /**
   * The start value of the range.
   * Either an absolute date, formatted as `YYYY/MM/DD@HH:mm:ss`, or a relative date object.
   */
  start: string | RelativeDate;

  /**
   * The end value of the range.
   * Either an absolute date, formatted as `YYYY/MM/DD@HH:mm:ss`, or a relative date object.
   */
  end: string | RelativeDate;

  /**
   * Whether to include the `end` value in the range.
   */
  endInclusive: boolean;

  /**
   * The current facet value state.
   */
  state: FacetValueState;
}

export interface DateRangeMappedRequest extends DateRangeRequest {
  start: string | RelativeDateMap;
  end: string | RelativeDateMap;
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
