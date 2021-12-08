import {ComponentSelector, CypressSelector} from '../common-selectors';

export const resultlistComponent = 'c-quantic-recent-results-list';

export interface RecentResultsListSelector extends ComponentSelector {
  placeholder: () => CypressSelector;
  results: () => CypressSelector;
  resultLinks: () => CypressSelector;
  resultAtIndex: (index: number) => CypressSelector;
  emptyList: () => CypressSelector;
}

export const RecentResultsListSelectors: RecentResultsListSelector = {
  get: () => cy.get(resultlistComponent),

  placeholder: () =>
    RecentResultsListSelectors.get().find('.placeholder__card-container'),
  results: () =>
    RecentResultsListSelectors.get().find('.recent-result__container'),
  resultLinks: () =>
    RecentResultsListSelectors.get().find('c-quantic-recent-result-link'),
  resultAtIndex: (index: number) =>
    RecentResultsListSelectors.resultLinks().eq(index).find('a'),
  emptyList: () => RecentResultsListSelectors.get().find('.empty-list-message'),
};
