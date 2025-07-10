import type {BaseParam} from '../../platform-service-params.js';
import type {AuthenticationParam} from '../search-api-params.js';
import type {CategoryFacetSearchRequest} from './category-facet-search/category-facet-search-request.js';
import type {SpecificFacetSearchRequest} from './specific-facet-search/specific-facet-search-request.js';

export type FacetSearchRequest = BaseParam &
  AuthenticationParam &
  (SpecificFacetSearchRequest | CategoryFacetSearchRequest);
