import {makeAnalyticsAction, SearchAction} from '../analytics/analytics-utils';
import {getSortCriteriaInitialState} from './sort-criteria-state';

export const logResultsSort = (): SearchAction =>
  makeAnalyticsAction('analytics/sort/results', (client, state) =>
    client.makeResultsSort({
      resultsSortBy: state.sortCriteria || getSortCriteriaInitialState(),
    })
  );
