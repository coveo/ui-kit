import {
  BaseFacetRequest,
  CurrentValues,
  Freezable,
  Delimitable,
  Type,
  SortCriteria,
  BaseFacetValueRequest,
} from '../../facet-api/request';

export type FacetSortCriterion = 'score' | 'alphanumeric';

export interface FacetValueRequest extends BaseFacetValueRequest {
  value: string;
}

export interface FacetRequest
  extends BaseFacetRequest,
    CurrentValues<FacetValueRequest>,
    Freezable,
    Delimitable,
    Type<'specific'>,
    SortCriteria<FacetSortCriterion> {}
