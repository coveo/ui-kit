import type {
  CategoryFacetResponse,
  CategoryFacetValue,
} from '../../category-facet-set/interfaces/response.js';
import type {
  FacetResponse,
  FacetValue,
} from '../../facet-set/interfaces/response.js';
import type {DateFacetValue} from '../../range-facets/date-facet-set/interfaces/response.js';
import type {RangeFacetResponse} from '../../range-facets/generic/interfaces/range-facet.js';
import type {NumericFacetValue} from '../../range-facets/numeric-facet-set/interfaces/response.js';

export type AnyFacetResponse =
  | FacetResponse
  | RangeFacetResponse
  | CategoryFacetResponse;

export type AnyFacetValue =
  | FacetValue
  | NumericFacetValue
  | CategoryFacetValue
  | DateFacetValue;
