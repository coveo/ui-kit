import {BaseParam} from '../../platform-service-params';
import {AuthenticationParam} from '../search-api-params';
import {CategoryFacetSearchRequest} from './category-facet-search/category-facet-search-request';
import {SpecificFacetSearchRequest} from './specific-facet-search/specific-facet-search-request';

export type FacetSearchRequest = BaseParam &
  AuthenticationParam &
  (SpecificFacetSearchRequest | CategoryFacetSearchRequest);
