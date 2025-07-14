import {
  type LegacySearchAction,
  makeAnalyticsAction,
} from '../analytics/analytics-utils.js';
import {SearchPageEvents} from '../analytics/search-action-cause.js';
import type {SearchAction} from '../search/search-actions.js';
import {getSortCriteriaInitialState} from './sort-criteria-state.js';

//TODO: KIT-2859
export const logResultsSort = (): LegacySearchAction =>
  makeAnalyticsAction('analytics/sort/results', (client, state) =>
    client.makeResultsSort({
      resultsSortBy: state.sortCriteria || getSortCriteriaInitialState(),
    })
  );

export const resultsSort = (): SearchAction => ({
  actionCause: SearchPageEvents.resultsSort,
});
