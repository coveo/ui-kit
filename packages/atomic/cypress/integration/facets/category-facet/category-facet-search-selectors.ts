import {CategoryFacetSelectors} from './category-facet-selectors';

export const CategoryFacetSearchSelectors = {
  searchInput: () =>
    CategoryFacetSelectors.shadow().find('[part="search-input"]'),
  searchClearButton: () =>
    CategoryFacetSelectors.shadow().find('[part="search-input-clear-button"]'),
  searchResults: () =>
    CategoryFacetSelectors.shadow().find('[part="search-results"]'),
  searchResult: () =>
    CategoryFacetSelectors.shadow().find('[part="search-result"]'),
  searchResultButton: () =>
    CategoryFacetSelectors.shadow().find('[part="search-result-button"]'),
  searchResultValueLabel: () =>
    CategoryFacetSelectors.shadow().find(
      '[part="search-results"] [part="value-label"]'
    ),
  searchResultValueCount: () =>
    CategoryFacetSelectors.shadow().find(
      '[part="search-results"] [part="value-count"]'
    ),
};
