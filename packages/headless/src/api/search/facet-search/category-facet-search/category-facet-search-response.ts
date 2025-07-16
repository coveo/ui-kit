import type {
  BaseFacetSearchResponse,
  BaseFacetSearchResult,
} from '../base/base-facet-search-response.js';

export interface CategoryFacetSearchResult extends BaseFacetSearchResult {
  /**
   * The hierarchical path to the value.
   */
  path: string[];
}

export type CategoryFacetSearchResponse =
  BaseFacetSearchResponse<CategoryFacetSearchResult>;
