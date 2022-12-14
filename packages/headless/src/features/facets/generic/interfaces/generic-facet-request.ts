import {
  CategoryFacetRequest,
  CategoryFacetValueRequest,
} from '../../category-facet-set/interfaces/request';
import {
  FacetRequest,
  FacetValueRequest,
} from '../../facet-set/interfaces/request';
import {DateRangeRequest} from '../../range-facets/date-facet-set/interfaces/request';
import {RangeFacetRequest} from '../../range-facets/generic/interfaces/range-facet';
import {NumericRangeRequest} from '../../range-facets/numeric-facet-set/interfaces/request';
import {AnyFacetSetState} from './generic-facet-section';

export type AnyFacetRequest =
  | FacetRequest
  | RangeFacetRequest
  | CategoryFacetRequest;

export type AnyFacetValueRequest =
  | FacetValueRequest
  | CategoryFacetValueRequest
  | NumericRangeRequest
  | DateRangeRequest;

type InferRequestFromFacetSetState<T extends AnyFacetSetState> =
  T[string]['request'];

export function getFacetRequests<T extends AnyFacetSetState>(state: T) {
  return Object.values(state).map(
    (slice) => slice.request
  ) as InferRequestFromFacetSetState<T>[];
}
