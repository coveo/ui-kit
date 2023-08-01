import {ComponentSelector, CypressSelector} from '../../common-selectors';

export const modalComponent = 'c-quantic-refine-toggle';

export interface RefineToggleSelector extends ComponentSelector {
  refineToggle: () => CypressSelector;
  refineToggleIcon: () => CypressSelector;
  refineModalCloseButton: () => CypressSelector;
  refineModalTitle: () => CypressSelector;
  facetManager: () => CypressSelector;
  modal: () => CypressSelector;
  modalContent: () => CypressSelector;
  modalFooter: () => CypressSelector;
  viewResultsButton: () => CypressSelector;
  total: () => CypressSelector;
  sort: () => CypressSelector;
  filtersCountBadge: () => CypressSelector;
  timeframeFacetExpandButton: () => CypressSelector;
  defaultFacetExpandButton: () => CypressSelector;
  numericFacetExpandButton: () => CypressSelector;
  categoryFacetExpandButton: () => CypressSelector;
  timeframeFacetFirstOption: () => CypressSelector;
  defaultFacetFirstOption: () => CypressSelector;
  numericFacetFirstOption: () => CypressSelector;
  categoryFacetFirstOption: () => CypressSelector;
  clearAllFiltersButton: () => CypressSelector;
  facetClearFiltersButton: () => CypressSelector;
  refineModalEmptyMessage: () => CypressSelector;
}

export const RefineToggleSelectors: RefineToggleSelector = {
  get: () => cy.get(modalComponent),

  refineToggle: () => RefineToggleSelectors.get().find('.refine-button'),
  refineToggleIcon: () =>
    RefineToggleSelectors.get().find('.custom-refine-icon'),
  refineModalCloseButton: () =>
    RefineToggleSelectors.get().find('.refine-modal__action'),
  refineModalTitle: () =>
    RefineToggleSelectors.get().find('.refine-modal__title'),
  facetManager: () =>
    RefineToggleSelectors.get().find('c-quantic-facet-manager'),
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
  defaultFacetExpandButton: () =>
    RefineToggleSelectors.modalContent().find('c-quantic-facet .facet__expand'),
  numericFacetExpandButton: () =>
    RefineToggleSelectors.modalContent().find(
      'c-quantic-numeric-facet .facet__expand'
    ),
  categoryFacetExpandButton: () =>
    RefineToggleSelectors.modalContent().find(
      'c-quantic-category-facet .facet__expand'
    ),
  timeframeFacetFirstOption: () =>
    RefineToggleSelectors.modalContent()
      .find('c-quantic-timeframe-facet .facet__value-option')
      .eq(0),
  defaultFacetFirstOption: () =>
    RefineToggleSelectors.modalContent()
      .find('c-quantic-facet .facet__value-option')
      .eq(0),
  numericFacetFirstOption: () =>
    RefineToggleSelectors.modalContent()
      .find('c-quantic-numeric-facet .facet__value-option')
      .eq(0),
  categoryFacetFirstOption: () =>
    RefineToggleSelectors.modalContent()
      .find('c-quantic-category-facet .facet__value-option')
      .eq(0),
  clearAllFiltersButton: () =>
    RefineToggleSelectors.modalContent().find(
      '.filters-header lightning-button'
    ),
  facetClearFiltersButton: () =>
    RefineToggleSelectors.modalContent().find(
      'c-quantic-facet .facet__clear-filter'
    ),
  refineModalEmptyMessage: () =>
    RefineToggleSelectors.get().find('.refine-modal__empty-message'),
};
