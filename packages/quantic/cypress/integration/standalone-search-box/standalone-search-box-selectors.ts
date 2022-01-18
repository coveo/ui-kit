import {ComponentSelector, CypressSelector} from '../common-selectors';

export const standaloneSearchBoxComponent = 'c-quantic-standalone-search-box';

export interface StandaloneSearchBoxSelector extends ComponentSelector {
  input: () => CypressSelector;
  suggestionList: () => CypressSelector;
  clearButton: () => CypressSelector;
  searchIcon: () => CypressSelector;
  searchButton: () => CypressSelector;
}

export const StandaloneSearchBoxSelectors: StandaloneSearchBoxSelector = {
  get: () => cy.get(standaloneSearchBoxComponent),
  input: () => StandaloneSearchBoxSelectors.get().find('input[type="search"]'),
  suggestionList: () =>
    StandaloneSearchBoxSelectors.get().find(
      'c-quantic-search-box-suggestions-list li'
    ),
  clearButton: () =>
    StandaloneSearchBoxSelectors.get().find('.slds-input__icon_right'),
  searchIcon: () =>
    StandaloneSearchBoxSelectors.get().find('.slds-input__icon_left'),
  searchButton: () =>
    StandaloneSearchBoxSelectors.get().find('.searchbox__submit-button-icon'),
};
