import type {CurrentValues, Type} from '../../../facet-api/request.js';
import type {FacetValueState} from '../../../facet-api/value.js';
import type {BaseRangeFacetRequest} from '../../generic/interfaces/request.js';

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

  /**
   * The previous facet value state in the search interface.
   *
   * Tracks the state before the most recent transition to enable analytics reporting
   * on facet selection behavior and support Event Protocol migration. Also used for
   * preserving facet values during automatic range generation.
   */
  previousState?: FacetValueState;
}

export interface NumericFacetRequest
  extends BaseRangeFacetRequest,
    CurrentValues<NumericRangeRequest>,
    Type<'numericalRange'> {}
