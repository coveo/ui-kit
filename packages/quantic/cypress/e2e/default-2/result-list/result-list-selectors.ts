import {ComponentSelector, CypressSelector} from '../../common-selectors';

export const resultlistComponent = 'c-quantic-result-list';

export interface ResultListSelector extends ComponentSelector {
  placeholder: () => CypressSelector;
  results: () => CypressSelector;
  resultLinks: () => CypressSelector;
}

export const ResultListSelectors: ResultListSelector = {
  get: () => cy.get(resultlistComponent),

  placeholder: () =>
    ResultListSelectors.get().find('.placeholder__result-container'),
  results: () => ResultListSelectors.get().find('c-quantic-result'),
  resultLinks: () =>
    ResultListSelectors.get().find('c-quantic-result [data-cy="result-link"]'),
};
