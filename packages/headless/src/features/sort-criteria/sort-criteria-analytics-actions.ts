import {
  makeAnalyticsAction,
  AnalyticsType,
} from '../analytics/analytics-actions';
import {getSortCriteriaInitialState} from './sort-criteria-state';

/**
 * Log results sort
 */
export const logResultsSort = makeAnalyticsAction(
  'analytics/sort/results',
  AnalyticsType.Search,
  (client, state) =>
    client.logResultsSort({
      resultsSortBy: state.sortCriteria || getSortCriteriaInitialState(),
    })
);
