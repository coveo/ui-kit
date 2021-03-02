import {FacetResponse, FacetValue} from '../../facet-set/interfaces/response';
import {RangeFacetResponse} from '../../range-facets/generic/interfaces/range-facet';
import {
  CategoryFacetResponse,
  CategoryFacetValue,
} from '../../category-facet-set/interfaces/response';
import {NumericFacetValue} from '../../range-facets/numeric-facet-set/interfaces/response';
import {DateFacetValue} from '../../range-facets/date-facet-set/interfaces/response';

export type AnyFacetResponse =
  | FacetResponse
  | RangeFacetResponse
  | CategoryFacetResponse;

export type AnyFacetValue =
  | FacetValue
  | NumericFacetValue
  | CategoryFacetValue
  | DateFacetValue;
