import {ComponentSelector, CypressSelector} from '../common-selectors';

export const recentQueriesListComponent = 'c-quantic-recent-queries-list';

export interface RecentQueriesListSelector extends ComponentSelector {
  placeholder: () => CypressSelector;
  queries: () => CypressSelector;
  lastQuery: () => CypressSelector;
  emptyList: () => CypressSelector;
  query: (value: string) => CypressSelector;
}

export const RecentQueriesListSelectors: RecentQueriesListSelector = {
  get: () => cy.get(recentQueriesListComponent),

  placeholder: () =>
    RecentQueriesListSelectors.get().find('.placeholder__card-container'),
  queries: () =>
    RecentQueriesListSelectors.get().find('.query-text__container'),
  emptyList: () => RecentQueriesListSelectors.get().find('.empty-list-message'),
  lastQuery: () => RecentQueriesListSelectors.queries().first(),
  query: (value: string) =>
    RecentQueriesListSelectors.get()
      .find('.query-text__container')
      .contains(value),
};
