import {ComponentSelector, CypressSelector} from '../../common-selectors';
import {
  BaseFacetSelector,
  FacetWithSearchSelector,
  FacetWithShowMoreLessSelector,
} from '../facet-common-selectors';

export const gategoryFacetComponent = 'c-quantic-category-facet';

export interface CategoryFacetSelector extends ComponentSelector {
  label: () => CypressSelector;
  values: () => CypressSelector;
  childValueOption: () => CypressSelector;
  parentValueOption: () => CypressSelector;
  facetCount: () => CypressSelector;
  searchInput: () => CypressSelector;
  clearFilterButton: () => CypressSelector;
  selectedValue: (value: string) => CypressSelector;
  placeholder: () => CypressSelector;
  collapseButton: () => CypressSelector;
  expandButton: () => CypressSelector;
  searchClearButton: () => CypressSelector;
  moreMatches: () => CypressSelector;
  noMatches: () => CypressSelector;
  showLessButton: () => CypressSelector;
  showMoreButton: () => CypressSelector;
  parentValueLabel: () => CypressSelector;
}

export type AllFacetSelectors = BaseFacetSelector &
  FacetWithSearchSelector &
  FacetWithShowMoreLessSelector &
  CategoryFacetSelector;

export const categoryFacetComponent = 'quantic-category-facet';
export const CategoryFacetSelectors: CategoryFacetSelector = {
  get: () => cy.get(gategoryFacetComponent),

  label: () => CategoryFacetSelectors.get().find('header h2 > span'),
  values: () =>
    CategoryFacetSelectors.get().find('c-quantic-category-facet-value'),
  selectedValue: (value: string) =>
    CategoryFacetSelectors.get().find(`span:containes("${value}")`),
  placeholder: () =>
    CategoryFacetSelectors.get().find('.placeholder__card-container'),
  clearFilterButton: () =>
    CategoryFacetSelectors.get().find('.facet__clear-filter'),
  parentValueOption: () =>
    CategoryFacetSelectors.get().find('.facet__active-parent'),
  parentValueLabel: () =>
    CategoryFacetSelectors.get().find('.facet__active-parent span'),
  collapseButton: () => CategoryFacetSelectors.get().find('.facet__collapse'),
  expandButton: () => CategoryFacetSelectors.get().find('.facet__expand'),
  childValueOption: () =>
    CategoryFacetSelectors.get().find('.facet__child-value-option'),
  facetCount: () =>
    CategoryFacetSelectors.get().find('.facet__number-of-results'),
  searchInput: () => CategoryFacetSelectors.get().find('input[type="search"]'),
  searchClearButton: () =>
    CategoryFacetSelectors.get().find('button[data-element-id="searchClear"]'),
  moreMatches: () =>
    CategoryFacetSelectors.get().find('.facet__search-results_more-matches'),
  noMatches: () =>
    CategoryFacetSelectors.get().find('.facet__search-results_no-match'),

  showLessButton: () => CategoryFacetSelectors.get().find('.facet__show-less'),
  showMoreButton: () => CategoryFacetSelectors.get().find('.facet__show-more'),
};
