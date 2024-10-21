import {
  BaseFacetSearchResponse,
  BaseFacetSearchResult,
} from '../../../search/facet-search/base/base-facet-search-response.js';

export type LocationFacetSearchResult = BaseFacetSearchResult;
export type LocationFacetSearchResponse =
  BaseFacetSearchResponse<LocationFacetSearchResult>;
