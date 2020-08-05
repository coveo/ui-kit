import {BaseFacetValue, BaseFacetResponse} from '../../facet-api/response';

interface BaseCategoryFacetValue extends BaseFacetValue {
  value: string;
  path: string[];
}

interface CategoryFacetLeafValue extends BaseCategoryFacetValue {
  children: [];
}

export interface CategoryFacetValue extends BaseCategoryFacetValue {
  children: (CategoryFacetValue | CategoryFacetLeafValue)[];
  moreValuesAvailable?: boolean;
}

export type CategoryFacetResponse = BaseFacetResponse<CategoryFacetValue>;
