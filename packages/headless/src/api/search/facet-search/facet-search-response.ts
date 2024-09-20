import {CategoryFacetSearchResponse} from './category-facet-search/category-facet-search-response.js';
import {SpecificFacetSearchResponse} from './specific-facet-search/specific-facet-search-response.js';

export type FacetSearchResponse =
  | SpecificFacetSearchResponse
  | CategoryFacetSearchResponse;
