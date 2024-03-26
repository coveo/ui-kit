import {CategoryFacetSearchResult} from '../../../../../api/search/facet-search/category-facet-search/category-facet-search-response';
import {SpecificFacetSearchResult} from '../../../../../api/search/facet-search/specific-facet-search/specific-facet-search-response';

// TODO move those interfaces to more fitting file(s)

export type SearchableFacetOptions = {
  facetSearch?: {facetQuery: string};
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
