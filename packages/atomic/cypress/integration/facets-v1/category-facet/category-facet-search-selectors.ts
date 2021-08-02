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
  activeSearchResult: () =>
    CategoryFacetSelectors.shadow().find('[part*="active-search-result"]'),
  searchNoResults: () =>
    CategoryFacetSelectors.shadow().find('[part="search-no-results"]'),
  searchResultButton: () =>
    CategoryFacetSelectors.shadow().find('[part="search-result-button"]'),
  searchResultValueLabel: () =>
    CategoryFacetSelectors.shadow().find(
      '[part="search-results"] [part="value-label"]'
    ),
  searchResultValueLabelHighlight: () =>
    CategoryFacetSelectors.shadow().find(
      '[part="search-results"] [part="value-label"] span'
    ),
  searchResultValueCount: () =>
    CategoryFacetSelectors.shadow().find(
      '[part="search-results"] [part="value-count"]'
    ),
  searchResultPath: () =>
    CategoryFacetSelectors.shadow().find(
      '[part="search-results"] [part="search-result-path"]'
    ),
};
