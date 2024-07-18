import {ComponentSelector, CypressSelector} from '../../common-selectors';

const refineContentComponent = 'c-quantic-refine-modal-content';
const refineContentContainer = '.facets-container';

export interface FacetSelector extends ComponentSelector {
  get: () => CypressSelector;
  facetManager: () => CypressSelector;
  facet: () => CypressSelector;
  numericFacet: () => CypressSelector;
  categoryFacet: () => CypressSelector;
  timeframeFacet: () => CypressSelector;
  dateFacet: () => CypressSelector;
  facetManagerItems: () => CypressSelector;
  timeframeFacetExpandButton: () => CypressSelector;
  facetExpandButton: () => CypressSelector;
  timeframeFacetClearFiltersButton: () => CypressSelector;
  facetClearFiltersButton: () => CypressSelector;
  timeframeFacetFirstOption: () => CypressSelector;
  facetFirstOption: () => CypressSelector;
  timeframeFacetValues: () => CypressSelector;
}

const getCommonFacetSelectors = (
  rootSelector: () => CypressSelector
): FacetSelector => {
  return {
    get: rootSelector,
    facet: () => rootSelector().find('c-quantic-facet'),
    numericFacet: () => rootSelector().find('c-quantic-numeric-facet'),
    categoryFacet: () => rootSelector().find('c-quantic-category-facet'),
    timeframeFacet: () => rootSelector().find('c-quantic-timeframe-facet'),
    dateFacet: () => rootSelector().find('c-quantic-date-facet'),
    facetManager: () => rootSelector().find('c-quantic-facet-manager'),
    facetManagerItems: () =>
      rootSelector().find('c-quantic-facet-manager .facet-manager__item'),
    timeframeFacetExpandButton: () =>
      rootSelector().find('c-quantic-timeframe-facet .facet__expand'),
    facetExpandButton: () =>
      rootSelector().find('c-quantic-facet .facet__expand'),
    timeframeFacetClearFiltersButton: () =>
      rootSelector().find('c-quantic-timeframe-facet .facet__clear-filter'),
    facetClearFiltersButton: () =>
      rootSelector().find('c-quantic-facet .facet__clear-filter'),
    timeframeFacetFirstOption: () =>
      rootSelector()
        .find('c-quantic-timeframe-facet .facet__value-option')
        .eq(0),
    facetFirstOption: () =>
      rootSelector().find('c-quantic-facet .facet__value-option').eq(0),
    timeframeFacetValues: () =>
      rootSelector().find('c-quantic-timeframe-facet c-quantic-facet-value'),
  };
};

export interface RefineContentSelector extends FacetSelector {
  container: FacetSelector;
  refineSort: () => CypressSelector;
  refineSortOption: (value: string) => CypressSelector;
  refineSortDropdown: () => CypressSelector;
  clearAllFiltersButton: () => CypressSelector;
  filtersTitle: () => CypressSelector;
}

export const RefineContentSelectors: RefineContentSelector = {
  container: getCommonFacetSelectors(() => cy.get(refineContentContainer)),
  ...getCommonFacetSelectors(() => cy.get(refineContentComponent)),
  refineSort: () => RefineContentSelectors.get().find('c-quantic-sort'),
  refineSortOption: (value: string) =>
    SortSelectors.get().find(`.slds-listbox__option[data-value="${value}"]`),
  refineSortDropdown: () =>
    RefineContentSelectors.get().find('[data-cy="sort-dropdown"]'),
  clearAllFiltersButton: () =>
    RefineContentSelectors.get().find('.filters-header lightning-button'),
  filtersTitle: () =>
    RefineContentSelectors.get().find('[data-cy="filters-title"]'),
};

export interface SortSelector extends ComponentSelector {
  get: () => CypressSelector;
  sort: () => CypressSelector;
  sortOption: (value: string) => CypressSelector;
  sortDropdown: () => CypressSelector;
}

export const SortSelectors: SortSelector = {
  get: () => cy.get('[data-cy="main-sort"]'),
  sort: () => SortSelectors.get(),
  sortOption: (value: string) =>
    SortSelectors.get().find(`.slds-listbox__option[data-value="${value}"]`),
  sortDropdown: () => SortSelectors.get().find('[data-cy="sort-dropdown"]'),
};
