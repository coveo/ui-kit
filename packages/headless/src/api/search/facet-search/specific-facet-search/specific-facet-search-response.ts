import type {
  BaseFacetSearchResponse,
  BaseFacetSearchResult,
} from '../base/base-facet-search-response.js';

export type SpecificFacetSearchResult = BaseFacetSearchResult;
export type SpecificFacetSearchResponse =
  BaseFacetSearchResponse<SpecificFacetSearchResult>;
