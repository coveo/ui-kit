import {
  makeAnalyticsAction,
  LegacySearchAction,
} from '../analytics/analytics-utils';
import {SearchPageEvents} from '../analytics/search-action-cause';
import {SearchAction} from '../search/search-actions';
import {getSortCriteriaInitialState} from './sort-criteria-state';

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
