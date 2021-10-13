import {ComponentSelector, CypressSelector} from '../common-selectors';

export const resultsPerPageComponent = 'c-quantic-results-per-page';

export interface ResultsPerPageSelector extends ComponentSelector {
  choice: () => CypressSelector;
  selected: () => CypressSelector;
}

export const ResultsPerPageSelectors: ResultsPerPageSelector = {
  get: () => cy.get(resultsPerPageComponent),

  choice: () => ResultsPerPageSelectors.get().find('button.slds-button'),
  selected: () =>
    ResultsPerPageSelectors.get().find('button.slds-button_brand'),
};
