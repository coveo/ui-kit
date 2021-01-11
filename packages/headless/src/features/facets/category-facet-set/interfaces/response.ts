import {BaseFacetValue, BaseFacetResponse} from '../../facet-api/response';

/**
 * @docsection Interfaces
 */
export interface CategoryFacetValue extends BaseFacetValue {
  value: string;
  path: string[];
  children: CategoryFacetValue[];
  moreValuesAvailable?: boolean;
}

export type CategoryFacetResponse = BaseFacetResponse<CategoryFacetValue>;
