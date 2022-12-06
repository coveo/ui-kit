import {
  AnalyticsType,
  InsightAction,
  makeInsightAnalyticsAction,
} from '../analytics/analytics-utils';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state';

export const logDidYouMeanClick = (): InsightAction =>
  makeInsightAnalyticsAction(
    'analytics/didyoumean/click',
    AnalyticsType.Search,
    (client, state) =>
      client.logDidYouMeanClick(
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      )
  );

export const logDidYouMeanAutomatic = (): InsightAction =>
  makeInsightAnalyticsAction(
    'analytics/didyoumean/automatic',
    AnalyticsType.Search,
    (client, state) =>
      client.logDidYouMeanAutomatic(
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      )
  );
