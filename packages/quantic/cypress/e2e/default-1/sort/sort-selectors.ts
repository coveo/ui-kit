import {
  ComponentErrorSelector,
  ComponentSelector,
  CypressSelector,
} from '../../common-selectors';

export const sortComponent = 'c-quantic-sort';

export interface SortSelector extends ComponentSelector {
  label: () => CypressSelector;
  combobox: () => CypressSelector;
  listbox: () => CypressSelector;
  options: () => CypressSelector;
  sortOption: (value: string) => CypressSelector;
  selectedOption: () => CypressSelector;
}

export const SortSelectors: SortSelector & ComponentErrorSelector = {
  get: () => cy.get(sortComponent),

  label: () => SortSelectors.get().find('.sort__header'),
  combobox: () => SortSelectors.get().find('.slds-combobox'),
  listbox: () => SortSelectors.get().find('.slds-listbox'),
  options: () => SortSelectors.get().find('.slds-listbox__option'),
  sortOption: (value: string) =>
    SortSelectors.get().find(`.slds-listbox__option[data-value="${value}"]`),
  selectedOption: () =>
    SortSelectors.get().find('.slds-listbox__option[aria-checked="true"]'),
  componentError: () => SortSelectors.get().find('c-quantic-component-error'),
  componentErrorMessage: () =>
    SortSelectors.get().find(
      'c-quantic-component-error [data-cy="error-message"]'
    ),
};
