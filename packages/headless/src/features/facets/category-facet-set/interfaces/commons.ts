import type {FacetValueState} from '../../facet-api/value.js';

export interface CategoryFacetValueCommon {
  /**
   * The facet value.
   */
  value: string;
  /**
   * The children of this facet value.
   */
  children: CategoryFacetValueCommon[];
  /**
   * Whether a facet value is filtering results (`selected`) or not (`idle`).
   */
  state: FacetValueState;
}
