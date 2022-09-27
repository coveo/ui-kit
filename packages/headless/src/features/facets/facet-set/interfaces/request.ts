import {
  BaseFacetRequest,
  CurrentValues,
  Freezable,
  Type,
  SortCriteria,
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
    SortCriteria<FacetSortCriterion> {
  /** @defaultValue `automatic` */
  sortCriteria: FacetSortCriterion;
  hasBreadcrumbs?: boolean;
}

export function isFacetRequest(req: AnyFacetRequest): req is FacetRequest {
  return (req as FacetRequest).hasBreadcrumbs !== undefined;
}
