import {
  InsightAction,
  makeInsightAnalyticsActionFactory,
} from '../analytics/analytics-utils';
import {SearchPageEvents} from '../analytics/search-action-cause';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state';

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
