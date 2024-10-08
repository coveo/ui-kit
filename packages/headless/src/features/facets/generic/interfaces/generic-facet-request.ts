import {
  CategoryFacetRequest,
  CategoryFacetValueRequest,
} from '../../category-facet-set/interfaces/request.js';
import {
  FacetRequest,
  FacetValueRequest,
} from '../../facet-set/interfaces/request.js';
import {DateRangeRequest} from '../../range-facets/date-facet-set/interfaces/request.js';
import {RangeFacetRequest} from '../../range-facets/generic/interfaces/range-facet.js';
import {NumericRangeRequest} from '../../range-facets/numeric-facet-set/interfaces/request.js';
import {AnyFacetSetState} from './generic-facet-section.js';

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
