import {BaseFacetResponse} from '../../../facet-api/response';
import {FacetValueState} from '../../../facet-api/value';

export interface NumericFacetValue {
  /**
   * Whether a facet value is filtering results (`selected`) or not (`idle`).
   */
  state: FacetValueState;
  /**
   * The number of results having the facet value.
   */
  numberOfResults: number;
  /**
   * The starting value for the numeric range
   */
  start: number;
  /**
   * The ending value for the numeric range
   */
  end: number;
  /**
   * Whether or not the end value is included in the range
   */
  endInclusive: boolean;
}

export type NumericFacetResponse = BaseFacetResponse<NumericFacetValue>;
