import {
  AnalyticsType,
  InsightAction,
  makeInsightAnalyticsAction,
} from '../analytics/analytics-utils.js';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state.js';
import {getSortCriteriaInitialState} from './sort-criteria-state.js';

export const logResultsSort = (): InsightAction =>
  makeInsightAnalyticsAction(
    'analytics/sort/results',
    AnalyticsType.Search,
    (client, state) =>
      client.logResultsSort({
        resultsSortBy: state.sortCriteria || getSortCriteriaInitialState(),
        ...getCaseContextAnalyticsMetadata(state.insightCaseContext),
      })
  );
