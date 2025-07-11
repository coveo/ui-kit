import type {CategoryFacetSearchResponse} from './category-facet-search/category-facet-search-response.js';
import type {SpecificFacetSearchResponse} from './specific-facet-search/specific-facet-search-response.js';

export type FacetSearchResponse =
  | SpecificFacetSearchResponse
  | CategoryFacetSearchResponse;
