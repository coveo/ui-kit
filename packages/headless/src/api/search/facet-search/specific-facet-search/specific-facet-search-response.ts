import {
  BaseFacetSearchResult,
  BaseFacetSearchResponse,
} from '../base/base-facet-search-response';

export type SpecificFacetSearchResult = BaseFacetSearchResult;
export type SpecificFacetSearchResponse = BaseFacetSearchResponse<
  SpecificFacetSearchResult
>;
