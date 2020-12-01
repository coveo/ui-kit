import {
  BaseFacetRequest,
  CurrentValues,
  Delimitable,
  Type,
  SortCriteria,
  BaseFacetValueRequest,
} from '../../facet-api/request';

export const categoryFacetSortCriteria = [
  'alphanumeric',
  'occurrences',
] as const;
export type CategoryFacetSortCriterion = typeof categoryFacetSortCriteria[number];

export interface CategoryFacetValueRequest extends BaseFacetValueRequest {
  value: string;
  children: CategoryFacetValueRequest[];
  retrieveChildren: boolean;
  retrieveCount: number;
}

export interface CategoryFacetRequest
  extends BaseFacetRequest,
    CurrentValues<CategoryFacetValueRequest>,
    Delimitable,
    Type<'hierarchical'>,
    SortCriteria<CategoryFacetSortCriterion> {
  basePath: string[];
  filterByBasePath: boolean;
}
