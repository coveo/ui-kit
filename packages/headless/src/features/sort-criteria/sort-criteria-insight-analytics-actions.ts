import {
  type InsightAction,
  makeInsightAnalyticsActionFactory,
} from '../analytics/analytics-utils.js';
import {SearchPageEvents} from '../analytics/search-action-cause.js';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state.js';
import {getSortCriteriaInitialState} from './sort-criteria-state.js';

export const logResultsSort = (): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.resultsSort)(
    'analytics/sort/results',
    (client, state) =>
      client.logResultsSort({
        resultsSortBy: state.sortCriteria || getSortCriteriaInitialState(),
        ...getCaseContextAnalyticsMetadata(state.insightCaseContext),
      })
  );
