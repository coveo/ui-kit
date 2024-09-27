import {
  BaseFacetRequest,
  CurrentValues,
  Freezable,
  Type,
  SortCriteria,
  BaseFacetValueRequest,
  Expandable,
  AllowedValues,
  CustomSort,
  SpecificSortCriteriaExplicitAlphanumeric,
} from '../../facet-api/request.js';

export const facetSortCriteria: FacetSortCriterion[] = [
  'score',
  'alphanumeric',
  'alphanumericDescending',
  'occurrences',
  'automatic',
];

export type FacetSortCriterion =
  | 'score'
  | 'alphanumeric'
  | 'alphanumericDescending'
  | 'occurrences'
  | 'automatic';

export type FacetSortOrder = 'ascending' | 'descending';

export interface FacetValueRequest extends BaseFacetValueRequest {
  value: string;
}

export interface FacetRequest
  extends BaseFacetRequest,
    CurrentValues<FacetValueRequest>,
    Expandable,
    Freezable,
    Type<'specific'>,
    AllowedValues,
    CustomSort,
    SortCriteria<
      FacetSortCriterion | SpecificSortCriteriaExplicitAlphanumeric
    > {
  /** @defaultValue `automatic` */
  sortCriteria: FacetSortCriterion | SpecificSortCriteriaExplicitAlphanumeric;
}
