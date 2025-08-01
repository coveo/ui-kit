import type {BaseFacetResponse} from '../../facet-api/response.js';
import type {CategoryFacetValueCommon} from './commons.js';

export type {CategoryFacetValueCommon} from './commons.js';
export interface CategoryFacetValue extends CategoryFacetValueCommon {
  /**
   * The number of results that match the facet value.
   * */
  numberOfResults: number;

  /**
   * The hierarchical path to the facet value.
   */
  path: string[];

  /**
   * The children of this facet value.
   */
  children: CategoryFacetValue[];

  /**
   * Whether more facet values are available.
   * */
  moreValuesAvailable: boolean;

  /**
   * When the hierarchical value has no children, this property is true.
   */
  isLeafValue: boolean;
}

export type CategoryFacetResponse = BaseFacetResponse<CategoryFacetValue>;
