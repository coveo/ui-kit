import {SpecificFacetSearchResponse} from './specific-facet-search/specific-facet-search-response';
import {CategoryFacetSearchResponse} from './category-facet-search/category-facet-search-response';

export type FacetSearchResponse =
  | SpecificFacetSearchResponse
  | CategoryFacetSearchResponse;
