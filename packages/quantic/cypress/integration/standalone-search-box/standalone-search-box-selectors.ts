import {ComponentSelector, CypressSelector} from '../common-selectors';

export const sortComponent = 'c-quantic-standalone-search-box';

export interface StandaloneSearchBoxSelector extends ComponentSelector {
  placeholder: () => CypressSelector;
}

export const StandaloneSearchBoxSelectors: StandaloneSearchBoxSelector = {
  get: () => cy.get(sortComponent),
  placeholder: () => StandaloneSearchBoxSelectors.get().find(''),
};
