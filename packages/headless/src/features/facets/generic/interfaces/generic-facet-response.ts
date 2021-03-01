import {FacetResponse, FacetValue} from '../../facet-set/interfaces/response';
import {RangeFacetResponse} from '../../range-facets/generic/interfaces/range-facet';
import {CategoryFacetResponse} from '../../category-facet-set/interfaces/response';
import {NumericFacetValue} from '../../range-facets/numeric-facet-set/interfaces/response';
import {DateFacetValue} from '../../range-facets/date-facet-set/interfaces/response';
import {CategoryFacetValue} from '../../../../controllers/facets/category-facet/headless-category-facet';

export type AnyFacetResponse =
  | FacetResponse
  | RangeFacetResponse
  | CategoryFacetResponse;

export type AnyFacetValue =
  | FacetValue
  | NumericFacetValue
  | CategoryFacetValue
  | DateFacetValue;
