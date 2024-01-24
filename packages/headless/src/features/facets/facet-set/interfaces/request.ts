import {
  BaseFacetRequest,
  CurrentValues,
  Freezable,
  SortCriteria,
  BaseFacetValueRequest,
  Expandable,
  AllowedValues,
  CustomSort,
  SpecificSortCriteriaExplicitAlphanumeric,
} from '../../facet-api/request';

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
  extends BaseFacetRequest<'specific'>,
    CurrentValues<FacetValueRequest>,
    Expandable,
    Freezable,
    AllowedValues,
    CustomSort,
    SortCriteria<
      FacetSortCriterion | SpecificSortCriteriaExplicitAlphanumeric
    > {
  /** @defaultValue `automatic` */
  sortCriteria: FacetSortCriterion | SpecificSortCriteriaExplicitAlphanumeric;
}
