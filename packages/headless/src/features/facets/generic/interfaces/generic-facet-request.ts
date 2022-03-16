import {
  FacetRequest,
  FacetValueRequest,
} from '../../facet-set/interfaces/request';
import {RangeFacetRequest} from '../../range-facets/generic/interfaces/range-facet';
import {
  CategoryFacetRequest,
  CategoryFacetValueRequest,
} from '../../category-facet-set/interfaces/request';
import {NumericRangeRequest} from '../../range-facets/numeric-facet-set/interfaces/request';
import {DateRangeRequest} from '../../range-facets/date-facet-set/interfaces/request';

export type AnyFacetRequest =
  | FacetRequest
  | RangeFacetRequest
  | CategoryFacetRequest;

export type AnyFacetValueRequest =
  | FacetValueRequest
  | CategoryFacetValueRequest
  | NumericRangeRequest
  | DateRangeRequest;
