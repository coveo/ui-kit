import {
  InsightAction,
  makeInsightAnalyticsActionFactory,
} from '../analytics/analytics-utils';
import {SearchPageEvents} from '../analytics/search-action-cause';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state';
import {getSortCriteriaInitialState} from './sort-criteria-state';

export const logResultsSort = (): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.resultsSort)(
    'analytics/sort/results',
    (client, state) =>
      client.logResultsSort({
        resultsSortBy: state.sortCriteria || getSortCriteriaInitialState(),
        ...getCaseContextAnalyticsMetadata(state.insightCaseContext),
      })
  );
