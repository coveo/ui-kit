import {FacetRequest} from '../../facet-set/interfaces/request';
import {RangeFacetRequest} from '../../range-facets/generic/interfaces/range-facet';
import {CategoryFacetRequest} from '../../category-facet-set/interfaces/request';

export type AnyFacetRequest =
  | FacetRequest
  | RangeFacetRequest
  | CategoryFacetRequest;
