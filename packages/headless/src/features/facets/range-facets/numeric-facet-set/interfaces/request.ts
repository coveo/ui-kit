import {CurrentValues, Type} from '../../../facet-api/request.js';
import {FacetValueState} from '../../../facet-api/value.js';
import {BaseRangeFacetRequest} from '../../generic/interfaces/request.js';

/**
 * The options defining a value to display in a `NumericFacet`.
 */
export interface NumericRangeRequest {
  /**
   * The start value of the range.
   */
  start: number;

  /**
   * The end value of the range.
   */
  end: number;

  /**
   * Whether to include the `end` value in the range.
   */
  endInclusive: boolean;

  /**
   * The current facet value state.
   */
  state: FacetValueState;
}

export interface NumericFacetRequest
  extends BaseRangeFacetRequest,
    CurrentValues<NumericRangeRequest>,
    Type<'numericalRange'> {}
