import {
  type InsightAction,
  makeInsightAnalyticsActionFactory,
} from '../analytics/analytics-utils.js';
import {SearchPageEvents} from '../analytics/search-action-cause.js';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state.js';

export const logClearRecentQueries = (): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.clearRecentQueries)(
    'analytics/recentQueries/clear',
    (client, state) =>
      client.logClearRecentQueries(
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      )
  );

//TODO: KIT-2859
export const logRecentQueryClick = (): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.recentQueriesClick)(
    'analytics/recentQueries/click',
    (client, state) =>
      client.logRecentQueryClick(
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      )
  );
