import {
  BaseFacetRequest,
  CurrentValues,
  Freezable,
  Type,
  BaseFacetValueRequest,
  Expandable,
  AllowedValues,
} from '../../facet-api/request';

export const facetSortCriteria: FacetSortCriterion[] = [
  'score',
  'alphanumeric',
  'occurrences',
  'automatic',
];
export type FacetSortCriterion =
  | 'score'
  | 'alphanumeric'
  | 'occurrences'
  | 'automatic';

export type BasicFacetSortCriterionOrCustom = FacetSortCriterion | 'custom';

export interface FacetValueRequest extends BaseFacetValueRequest {
  value: string;
}

export type FacetSortCriterionExplicit = {
  type: BasicFacetSortCriterionOrCustom;
  customSort: string[];
};

export type FaceSortCriterionStringOrExplicit =
  | FacetSortCriterion
  | FacetSortCriterionExplicit;

export interface FacetRequest
  extends BaseFacetRequest,
    CurrentValues<FacetValueRequest>,
    Expandable,
    Freezable,
    Type<'specific'>,
    AllowedValues {
  sortCriteria: FaceSortCriterionStringOrExplicit;
  hasBreadcrumbs?: boolean;
}
