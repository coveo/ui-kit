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
  SpecificSortCriteriaExplicit,
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
  | 'occurrences'
  | 'automatic'
  | 'alphanumericDescending';

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
    SortCriteria<FacetSortCriterion | SpecificSortCriteriaExplicit> {
  /** @defaultValue `automatic` */
  sortCriteria: FacetSortCriterion | SpecificSortCriteriaExplicit;
}
