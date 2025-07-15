import type {BaseFacetResponse} from '../../../facet-api/response.js';
import type {FacetValueState} from '../../../facet-api/value.js';

/**
 * The domain of a numeric facet.
 */
type NumericFacetDomain = {
  /**
   * The largest available value in the range.
   */
  end: number;
  /**
   * The smallest available value in the range.
   */
  start: number;
};

export interface NumericFacetValue {
  /**
   * The number of results that have the facet value.
   */
  numberOfResults: number;

  /**
   * The starting value for the numeric range.
   */
  start: number;

  /**
   * The ending value for the numeric range.
   */
  end: number;

  /**
   * Whether or not the end value is included in the range.
   */
  endInclusive: boolean;

  /**
   * The state of the facet value, indicating whether it is filtering results (`selected`) or not (`idle`).
   */
  state: FacetValueState;
}

export type NumericFacetResponse = BaseFacetResponse<NumericFacetValue> & {
  domain: NumericFacetDomain;
};
