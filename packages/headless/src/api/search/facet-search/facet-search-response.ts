import {CategoryFacetSearchResponse} from './category-facet-search/category-facet-search-response';
import {SpecificFacetSearchResponse} from './specific-facet-search/specific-facet-search-response';

export type FacetSearchResponse =
  | SpecificFacetSearchResponse
  | CategoryFacetSearchResponse;
