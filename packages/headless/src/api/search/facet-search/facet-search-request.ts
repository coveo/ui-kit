import {BaseParam} from '../../platform-service-params.js';
import {AuthenticationParam} from '../search-api-params.js';
import {CategoryFacetSearchRequest} from './category-facet-search/category-facet-search-request.js';
import {SpecificFacetSearchRequest} from './specific-facet-search/specific-facet-search-request.js';

export type FacetSearchRequest = BaseParam &
  AuthenticationParam &
  (SpecificFacetSearchRequest | CategoryFacetSearchRequest);
