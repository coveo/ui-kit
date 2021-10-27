import {ComponentSelector, CypressSelector} from '../../common-selectors';
import {
  FacetWithSearchSelector,
  FacetWithShowMoreLessSelector,
} from '../facet-common-selectors';

export const categoryFacetComponent = 'c-quantic-category-facet';

export interface CategoryFacetSelector extends ComponentSelector {
  label: () => CypressSelector;
  values: () => CypressSelector;
  childValueOption: () => CypressSelector;
  parentValueOption: () => CypressSelector;
  activeParentValueOption: () => CypressSelector;
  facetCount: () => CypressSelector;
  clearFilterButton: () => CypressSelector;
  placeholder: () => CypressSelector;
  collapseButton: () => CypressSelector;
  expandButton: () => CypressSelector;
  parentValueLabel: () => CypressSelector;
  allCategories: () => CypressSelector;
  searchResultPath: () => CypressSelector;
  searchResults: () => CypressSelector;
}

export type AllFacetSelectors = FacetWithSearchSelector &
  FacetWithShowMoreLessSelector &
  CategoryFacetSelector;

export const CategoryFacetSelectors: AllFacetSelectors = {
  get: () => cy.get(categoryFacetComponent),

  label: () => CategoryFacetSelectors.get().find('header h2 > span'),
  values: () =>
    CategoryFacetSelectors.get().find('c-quantic-category-facet-value'),
  placeholder: () =>
    CategoryFacetSelectors.get().find('.placeholder__card-container'),
  clearFilterButton: () =>
    CategoryFacetSelectors.get().find('.facet__clear-filter'),
  parentValueOption: () =>
    CategoryFacetSelectors.get().find('.facet__parent-value-option'),
  activeParentValueOption: () =>
    CategoryFacetSelectors.get().find('.facet__active-parent'),
  parentValueLabel: () =>
    CategoryFacetSelectors.get().find('.facet__active-parent span'),
  collapseButton: () => CategoryFacetSelectors.get().find('.facet__collapse'),
  expandButton: () => CategoryFacetSelectors.get().find('.facet__expand'),
  childValueOption: () =>
    CategoryFacetSelectors.get().find('.facet__child-value-option'),
  valueHighlight: () =>
    CategoryFacetSelectors.get().find(
      '.slds-rich-text-editor__output > span b'
    ),
  searchResultPath: () => CategoryFacetSelectors.get().find('.facet__path'),
  searchResults: () =>
    CategoryFacetSelectors.get().find('.slds-rich-text-editor__output'),
  facetCount: () =>
    CategoryFacetSelectors.get().find('.facet__number-of-results'),
  searchInput: () => CategoryFacetSelectors.get().find('input[type="search"]'),
  searchClearButton: () =>
    CategoryFacetSelectors.get().find('button[data-element-id="searchClear"]'),
  moreMatches: () =>
    CategoryFacetSelectors.get().find('.facet__search-results_more-matches'),
  noMatches: () =>
    CategoryFacetSelectors.get().find('.facet__search-results_no-match'),
  allCategories: () =>
    CategoryFacetSelectors.get().find('.facet__allCategories'),
  showLessButton: () => CategoryFacetSelectors.get().find('.facet__show-less'),
  showMoreButton: () => CategoryFacetSelectors.get().find('.facet__show-more'),
};
