import type {FacetSearchType} from '../../../../../api/commerce/facet-search/facet-search-request.js';
import type {CategoryFacetSearchResult} from '../../../../../api/search/facet-search/category-facet-search/category-facet-search-response.js';
import type {SpecificFacetSearchResult} from '../../../../../api/search/facet-search/specific-facet-search/specific-facet-search-response.js';

export type SearchableFacetOptions = {
  facetSearch: {facetQuery?: string; type: FacetSearchType};
};

export type CoreFacetSearchState<
  T extends SpecificFacetSearchResult | CategoryFacetSearchResult,
> = {
  /**
   * Whether the facet search request is in a pending state.
   */
  isLoading: boolean;
  /**
   * The facet search query.
   */
  query: string;
  /**
   * Whether additional values matching the facet search query are available.
   */
  moreValuesAvailable: boolean;
  /**
   * The facet values that match the facet search query.
   */
  values: T[];
};
