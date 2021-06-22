import {BaseFacetResponse} from '../../facet-api/response';
import {FacetValueState} from '../../facet-api/value';

export interface CategoryFacetValue {
  /**
   * Whether a facet value is filtering results (`selected`) or not (`idle`).
   * */
  state: FacetValueState;

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
   * The facet value.
   * */
  value: string;
}

export type CategoryFacetResponse = BaseFacetResponse<CategoryFacetValue>;
