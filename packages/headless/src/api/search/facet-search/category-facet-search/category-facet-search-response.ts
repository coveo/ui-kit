import {
  BaseFacetSearchResult,
  BaseFacetSearchResponse,
} from '../base/base-facet-search-response';

export interface CategoryFacetSearchResult extends BaseFacetSearchResult {
  path: string[];
}

export type CategoryFacetSearchResponse = BaseFacetSearchResponse<
  CategoryFacetSearchResult
>;
