import {CurrentValues, Type} from '../../../facet-api/request';
import {FacetValueState} from '../../../facet-api/value';
import {BaseRangeFacetRequest} from '../../generic/interfaces/request';

/**
 * The options defining a value to display in a `NumericFacet`.
 *
 * @group Core types and interfaces
 * @category Facets
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
