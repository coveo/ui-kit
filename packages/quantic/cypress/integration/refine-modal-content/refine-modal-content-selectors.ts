import {ComponentSelector, CypressSelector} from '../common-selectors';

const refineContentComponent = 'c-quantic-refine-modal-content';
const refineContentContainer = '.facets-container';

export interface RefineContentSelector extends FacetSelector {
  container: FacetSelector;
  sort: () => CypressSelector;
  clearAllFiltersButton: () => CypressSelector;
  filtersTitle: () => CypressSelector;
}

export interface FacetSelector extends ComponentSelector {
  get: () => CypressSelector;
  facetManager: () => CypressSelector;
  facet: () => CypressSelector;
  numericFacet: () => CypressSelector;
  categoryFacet: () => CypressSelector;
  timeframeFacet: () => CypressSelector;
  facetManagerItems: () => CypressSelector;
  timeframeFacetExpandButton: () => CypressSelector;
  facetExpandButton: () => CypressSelector;
  timeframeFacetClearFiltersButton: () => CypressSelector;
  facetClearFiltersButton: () => CypressSelector;
  timeframeFacetFirstOption: () => CypressSelector;
  facetFirstOption: () => CypressSelector;
}

const getCommonFacetSelectors = (container: boolean): FacetSelector => {
  return {
    get: () =>
      cy.get(container ? refineContentContainer : refineContentComponent),
    facet: () =>
      cy
        .get(container ? refineContentContainer : refineContentComponent)
        .find('c-quantic-facet'),
    numericFacet: () =>
      cy
        .get(container ? refineContentContainer : refineContentComponent)
        .find('c-quantic-numeric-facet'),
    categoryFacet: () =>
      cy
        .get(container ? refineContentContainer : refineContentComponent)
        .find('c-quantic-category-facet'),
    timeframeFacet: () =>
      cy
        .get(container ? refineContentContainer : refineContentComponent)
        .find('c-quantic-timeframe-facet'),
    facetManager: () =>
      cy
        .get(container ? refineContentContainer : refineContentComponent)
        .find('c-quantic-facet-manager'),
    facetManagerItems: () =>
      cy
        .get(container ? refineContentContainer : refineContentComponent)
        .find('c-quantic-facet-manager .facet-manager__item'),
    timeframeFacetExpandButton: () =>
      cy
        .get(container ? refineContentContainer : refineContentComponent)
        .find('c-quantic-timeframe-facet .facet__expand'),
    facetExpandButton: () =>
      cy
        .get(container ? refineContentContainer : refineContentComponent)
        .find('c-quantic-facet .facet__expand'),
    timeframeFacetClearFiltersButton: () =>
      cy
        .get(container ? refineContentContainer : refineContentComponent)
        .find('c-quantic-timeframe-facet .facet__clear-filter'),
    facetClearFiltersButton: () =>
      cy
        .get(container ? refineContentContainer : refineContentComponent)
        .find('c-quantic-facet .facet__clear-filter'),
    timeframeFacetFirstOption: () =>
      cy
        .get(container ? refineContentContainer : refineContentComponent)
        .find('c-quantic-timeframe-facet .facet__value-option')
        .eq(0),
    facetFirstOption: () =>
      cy
        .get(container ? refineContentContainer : refineContentComponent)
        .find('c-quantic-facet .facet__value-option')
        .eq(0),
  };
};

export const RefineContentSelectors: RefineContentSelector = {
  container: getCommonFacetSelectors(true),
  ...getCommonFacetSelectors(false),
  sort: () => RefineContentSelectors.get().find('c-quantic-sort'),
  clearAllFiltersButton: () =>
    RefineContentSelectors.get().find('.filters-header lightning-button'),
  filtersTitle: () =>
    RefineContentSelectors.get().find(
      '.filters-header .slds-text-heading_small'
    ),
};
