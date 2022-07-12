import {
  AnalyticsType,
  makeInsightAnalyticsAction,
} from '../analytics/analytics-utils';
import {getSortCriteriaInitialState} from './sort-criteria-state';

export const logResultsSort = makeInsightAnalyticsAction(
  'analytics/sort/results',
  AnalyticsType.Search,
  (client, state) =>
    client.logResultsSort({
      resultsSortBy: state.sortCriteria || getSortCriteriaInitialState(),
    })
);
