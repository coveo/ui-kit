import {
  AnalyticsType,
  makeAnalyticsAction,
  SearchAction,
} from '../analytics/analytics-utils.js';
import {getSortCriteriaInitialState} from './sort-criteria-state.js';

export const logResultsSort = (): SearchAction =>
  makeAnalyticsAction(
    'analytics/sort/results',
    AnalyticsType.Search,
    (client, state) =>
      client.makeResultsSort({
        resultsSortBy: state.sortCriteria || getSortCriteriaInitialState(),
      })
  );
