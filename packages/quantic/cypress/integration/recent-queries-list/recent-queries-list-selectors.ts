import {ComponentSelector, CypressSelector} from '../common-selectors';

export const recentquerieslistComponent = 'c-quantic-recent-queries-list';

export interface RecentQueriesListSelector extends ComponentSelector {
  placeholder: () => CypressSelector;
  queries: () => CypressSelector;
  lastQuery: () => CypressSelector;
  emptyList: () => CypressSelector;
}

export const RecentQueriesListSelectors: RecentQueriesListSelector = {
  get: () => cy.get(recentquerieslistComponent),

  placeholder: () =>
    RecentQueriesListSelectors.get().find('.placeholder__card-container'),
  queries: () =>
    RecentQueriesListSelectors.get().find('.query-text__container'),
  emptyList: () => RecentQueriesListSelectors.get().find('.empty-list-message'),
  lastQuery: () => RecentQueriesListSelectors.queries().first(),
};
