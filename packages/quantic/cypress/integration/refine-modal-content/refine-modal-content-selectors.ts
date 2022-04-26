import {ComponentSelector, CypressSelector} from '../common-selectors';

const refineContentComponent = 'c-quantic-refine-modal-content';
const refineContentContainer = '.facets-container';

export interface RefineContentSelector extends ComponentSelector {
  getContainer: () => CypressSelector;
  facetManager: () => CypressSelector;
  duplicatedFacetManager: () => CypressSelector;
  facet: () => CypressSelector;
  duplicatedFacet: () => CypressSelector;
  numericFacet: () => CypressSelector;
  duplicatedNumericFacet: () => CypressSelector;
  categoryFacet: () => CypressSelector;
  duplicatedCategoryFacet: () => CypressSelector;
  timeframeFacet: () => CypressSelector;
  duplicatedTimeframeFacet: () => CypressSelector;
  duplicatedFacetManagerItems: () => CypressSelector;
  facetManagerItems: () => CypressSelector;
  sort: () => CypressSelector;
  clearAllFiltersButton: () => CypressSelector;
  filtersTitle: () => CypressSelector;
  duplicatedTimeframeFacetExpandButton: () => CypressSelector;
  duplicatedFacetExpandButton: () => CypressSelector;
  duplicatedTimeframeFacetClearFiltersButton: () => CypressSelector;
  duplicatedFacetClearFiltersButton: () => CypressSelector;
  timeframeFacetClearFiltersButton: () => CypressSelector;
  facetClearFiltersButton: () => CypressSelector;
  duplicatedTimeframeFacetFirstOption: () => CypressSelector;
  duplicatedFacetFirstOption: () => CypressSelector;
}

export const RefineContentSelectors: RefineContentSelector = {
  get: () => cy.get(refineContentComponent),
  getContainer: () => cy.get(refineContentContainer),

  facetManager: () =>
    RefineContentSelectors.getContainer().find('c-quantic-facet-manager'),

  duplicatedFacetManager: () =>
    RefineContentSelectors.get().find('c-quantic-facet-manager'),

  facet: () => RefineContentSelectors.getContainer().find('c-quantic-facet'),

  duplicatedFacet: () => RefineContentSelectors.get().find('c-quantic-facet'),

  numericFacet: () =>
    RefineContentSelectors.getContainer().find('c-quantic-numeric-facet'),

  duplicatedNumericFacet: () =>
    RefineContentSelectors.get().find('c-quantic-numeric-facet'),

  categoryFacet: () =>
    RefineContentSelectors.getContainer().find('c-quantic-category-facet'),

  duplicatedCategoryFacet: () =>
    RefineContentSelectors.get().find('c-quantic-category-facet'),

  timeframeFacet: () =>
    RefineContentSelectors.getContainer().find('c-quantic-timeframe-facet'),

  duplicatedTimeframeFacet: () =>
    RefineContentSelectors.get().find('c-quantic-timeframe-facet'),

  facetManagerItems: () =>
    RefineContentSelectors.facetManager().find('.facet-manager__item'),

  duplicatedFacetManagerItems: () =>
    RefineContentSelectors.duplicatedFacetManager().find(
      '.facet-manager__item'
    ),

  sort: () => RefineContentSelectors.get().find('c-quantic-sort'),

  clearAllFiltersButton: () =>
    RefineContentSelectors.get().find('.filters-header lightning-button'),

  filtersTitle: () =>
    RefineContentSelectors.get().find(
      '.filters-header .slds-text-heading_small'
    ),

  duplicatedTimeframeFacetExpandButton: () =>
    RefineContentSelectors.duplicatedTimeframeFacet().find('.facet__expand'),

  duplicatedFacetExpandButton: () =>
    RefineContentSelectors.duplicatedFacet().find('.facet__expand'),

  duplicatedTimeframeFacetClearFiltersButton: () =>
    RefineContentSelectors.duplicatedTimeframeFacet().find(
      '.facet__clear-filter'
    ),

  duplicatedFacetClearFiltersButton: () =>
    RefineContentSelectors.duplicatedFacet().find('.facet__clear-filter'),

  timeframeFacetClearFiltersButton: () =>
    RefineContentSelectors.timeframeFacet().find('.facet__clear-filter'),

  facetClearFiltersButton: () =>
    RefineContentSelectors.facet().find('.facet__clear-filter'),

  duplicatedTimeframeFacetFirstOption: () =>
    RefineContentSelectors.duplicatedTimeframeFacet()
      .find('.facet__value-option')
      .eq(0),

  duplicatedFacetFirstOption: () =>
    RefineContentSelectors.duplicatedFacet().find('.facet__value-option').eq(0),
};
