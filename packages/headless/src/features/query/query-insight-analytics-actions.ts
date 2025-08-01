import {
  type InsightAction,
  makeInsightAnalyticsActionFactory,
} from '../analytics/analytics-utils.js';
import {SearchPageEvents} from '../analytics/search-action-cause.js';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state.js';

export const logSearchboxSubmit = (): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.searchboxSubmit)(
    'analytics/searchbox/submit',
    (client, state) =>
      client.logSearchboxSubmit(
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      )
  );
