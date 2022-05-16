import {ComponentSelector, CypressSelector} from '../common-selectors';

export const modalComponent = 'c-quantic-refine-toggle';

export interface RefineToggleSelector extends ComponentSelector {
  refineToggle: () => CypressSelector;
  refineToggleIcon: () => CypressSelector;
  refineModalCloseButton: () => CypressSelector;
  refineModalTitle: () => CypressSelector;
  modal: () => CypressSelector;
  modalContent: () => CypressSelector;
  modalFooter: () => CypressSelector;
  viewResultsButton: () => CypressSelector;
  total: () => CypressSelector;
  sort: () => CypressSelector;
  filtersCountBadge: () => CypressSelector;
  timeframeFacetExpandButton: () => CypressSelector;
  facetExpandButton: () => CypressSelector;
  timeframeFacetFirstOption: () => CypressSelector;
  facetFirstOption: () => CypressSelector;
  clearAllFiltersButton: () => CypressSelector;
  facetClearFiltersButton: () => CypressSelector;
}

export const RefineToggleSelectors: RefineToggleSelector = {
  get: () => cy.get(modalComponent),

  refineToggle: () => RefineToggleSelectors.get().find('.refine-button'),
  refineToggleIcon: () =>
    RefineToggleSelectors.refineToggle().find('lightning-icon'),
  refineModalCloseButton: () =>
    RefineToggleSelectors.get().find('.refine-modal__action'),
  refineModalTitle: () =>
    RefineToggleSelectors.get().find('.refine-modal__title'),
  modal: () => RefineToggleSelectors.get().find('.modal'),
  modalContent: () =>
    RefineToggleSelectors.get().find('c-quantic-refine-modal-content'),
  modalFooter: () => RefineToggleSelectors.get().find('.refine-modal__footer'),
  viewResultsButton: () =>
    RefineToggleSelectors.modalFooter().find('.slds-button'),
  total: () => RefineToggleSelectors.get().find('.summary__total'),
  sort: () => RefineToggleSelectors.modalContent().find('c-quantic-sort'),
  filtersCountBadge: () =>
    RefineToggleSelectors.get().find('.refine-button_filters-badge'),
  timeframeFacetExpandButton: () =>
    RefineToggleSelectors.modalContent().find(
      'c-quantic-timeframe-facet .facet__expand'
    ),
  facetExpandButton: () =>
    RefineToggleSelectors.modalContent().find('c-quantic-facet .facet__expand'),
  timeframeFacetFirstOption: () =>
    RefineToggleSelectors.modalContent()
      .find('c-quantic-timeframe-facet .facet__value-option')
      .eq(0),
  facetFirstOption: () =>
    RefineToggleSelectors.modalContent()
      .find('c-quantic-facet .facet__value-option')
      .eq(0),
  clearAllFiltersButton: () =>
    RefineToggleSelectors.modalContent().find(
      '.filters-header lightning-button'
    ),
  facetClearFiltersButton: () =>
    RefineToggleSelectors.modalContent().find(
      'c-quantic-facet .facet__clear-filter'
    ),
};
