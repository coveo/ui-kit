import {
  type InsightAction,
  makeInsightAnalyticsActionFactory,
} from '../analytics/analytics-utils.js';
import {SearchPageEvents} from '../analytics/search-action-cause.js';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state.js';

export const logDidYouMeanClick = (): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.didYouMeanClick)(
    'analytics/didyoumean/click',
    (client, state) =>
      client.logDidYouMeanClick(
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      )
  );

export const logDidYouMeanAutomatic = (): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.didYouMeanAutomatic)(
    'analytics/didyoumean/automatic',
    (client, state) =>
      client.logDidYouMeanAutomatic(
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      )
  );
