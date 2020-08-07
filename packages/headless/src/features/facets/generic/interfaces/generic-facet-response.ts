import {FacetResponse} from '../../facet-set/interfaces/response';
import {RangeFacetResponse} from '../../range-facets/generic/interfaces/range-facet';
import {CategoryFacetResponse} from '../../category-facet-set/interfaces/response';

export type AnyFacetResponse =
  | FacetResponse
  | RangeFacetResponse
  | CategoryFacetResponse;
