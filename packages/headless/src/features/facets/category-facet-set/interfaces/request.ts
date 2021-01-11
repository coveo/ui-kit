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
/**
 * @docsection Types
 */
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
  /** @default 5 */
  numberOfValues: number;
  /** @default ";" */
  delimitingCharacter: string;
  /** @default "occurrences" */
  sortCriteria: CategoryFacetSortCriterion;
  /** The base path shared by all values for the facet.
   * @default []
   */
  basePath: string[];
  /** Whether to use basePath as a filter for the results.
   * @default true
   */
  filterByBasePath: boolean;
}
