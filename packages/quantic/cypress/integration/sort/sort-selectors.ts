import {ComponentSelector, CypressSelector} from '../common-selectors';

export const sortComponent = 'c-quantic-sort';

export interface SortSelector extends ComponentSelector {
  listbox: () => CypressSelector;
  options: () => CypressSelector;
  option: (value: string) => CypressSelector;
}

export const SortSelectors: SortSelector = {
  get: () => cy.get(sortComponent),

  listbox: () => SortSelectors.get().find('.slds-listbox'),
  options: () => SortSelectors.get().find('.slds-listbox__option'),
  option: (value: string) =>
    SortSelectors.get().find(`.slds-listbox__option[data-value="${value}"`),
};
