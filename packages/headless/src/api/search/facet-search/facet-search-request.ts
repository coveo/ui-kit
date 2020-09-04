import {SpecificFacetSearchRequest} from './specific-facet-search/specific-facet-search-request';
import {CategoryFacetSearchRequest} from './category-facet-search/category-facet-search-request';

export type FacetSearchRequest =
  | SpecificFacetSearchRequest
  | CategoryFacetSearchRequest;
