import {
  InsightAction,
  makeInsightAnalyticsAction,
} from '../analytics/analytics-utils';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state';
import {getSortCriteriaInitialState} from './sort-criteria-state';

export const logResultsSort = (): InsightAction =>
  makeInsightAnalyticsAction('analytics/sort/results', (client, state) =>
    client.logResultsSort({
      resultsSortBy: state.sortCriteria || getSortCriteriaInitialState(),
      ...getCaseContextAnalyticsMetadata(state.insightCaseContext),
    })
  );
