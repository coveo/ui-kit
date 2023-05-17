import {AnalyticsType, SearchAction} from '../analytics/analytics-utils';
import {makeAnalyticsAction} from '../analytics/search-analytics-utils';
import {getSortCriteriaInitialState} from './sort-criteria-state';

export const logResultsSort = (): SearchAction =>
  makeAnalyticsAction(
    'analytics/sort/results',
    AnalyticsType.Search,
    (client, state) =>
      client.makeResultsSort({
        resultsSortBy: state.sortCriteria || getSortCriteriaInitialState(),
      })
  );
