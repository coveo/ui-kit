import {ComponentSelector, CypressSelector} from '../common-selectors';

export const resultlistComponent = 'c-quantic-recent-results-list';

export interface RecentResultsListSelector extends ComponentSelector {
  placeholder: () => CypressSelector;
  label: () => CypressSelector;
  results: () => CypressSelector;
  resultLinks: () => CypressSelector;
  lastResult: () => CypressSelector;
  emptyList: () => CypressSelector;
  result: (value: string) => CypressSelector;
}

export const RecentResultsListSelectors: RecentResultsListSelector = {
  get: () => cy.get(resultlistComponent),

  placeholder: () =>
    RecentResultsListSelectors.get().find('.placeholder__card-container'),
  label: () => RecentResultsListSelectors.get().find('header h2 > span'),
  results: () =>
    RecentResultsListSelectors.get().find('.recent-result__container'),
  resultLinks: () =>
    RecentResultsListSelectors.get().find('c-quantic-recent-result-link'),
  lastResult: () => RecentResultsListSelectors.resultLinks().first(),
  emptyList: () => RecentResultsListSelectors.get().find('.empty-list-message'),
  result: (value: string) =>
    RecentResultsListSelectors.resultLinks().contains(value),
};
