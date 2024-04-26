import {
  InsightAction,
  makeInsightAnalyticsActionFactory,
} from '../analytics/analytics-utils';
import {SearchPageEvents} from '../analytics/search-action-cause';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state';

export const logSearchboxSubmit = (): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.searchboxSubmit)(
    'analytics/searchbox/submit',
    (client, state) =>
      client.logSearchboxSubmit(
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      )
  );
