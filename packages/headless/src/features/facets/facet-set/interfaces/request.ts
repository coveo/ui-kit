import {
  BaseFacetRequest,
  CurrentValues,
  Freezable,
  Delimitable,
  Type,
  BaseFacetValueRequest,
  Expandable,
  AllowedValues,
} from '../../facet-api/request';
import {AnyFacetRequest} from '../../generic/interfaces/generic-facet-request';

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
    Delimitable,
    Type<'specific'>,
    AllowedValues {
  sortCriteria: FaceSortCriterionStringOrExplicit;
  hasBreadcrumbs?: boolean;
}

export function isFacetRequest(req: AnyFacetRequest): req is FacetRequest {
  return (req as FacetRequest).hasBreadcrumbs !== undefined;
}
