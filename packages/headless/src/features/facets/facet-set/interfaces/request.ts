import {
  BaseFacetRequest,
  CurrentValues,
  Freezable,
  Delimitable,
  Type,
  SortCriteria,
  BaseFacetValueRequest,
  Expandable,
} from '../../facet-api/request';

export const facetSortCriteria = [
  'score',
  'alphanumeric',
  'occurrences',
  'automatic',
] as const;
/**
 * @docsection Types
 */
export type FacetSortCriterion = typeof facetSortCriteria[number];

export interface FacetValueRequest extends BaseFacetValueRequest {
  value: string;
}

export interface FacetRequest
  extends BaseFacetRequest,
    CurrentValues<FacetValueRequest>,
    Expandable,
    Freezable,
    Delimitable,
    Type<'specific'>,
    SortCriteria<FacetSortCriterion> {
  /** @default "automatic" */
  sortCriteria: FacetSortCriterion;
}
