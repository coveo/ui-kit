import {
  AnalyticsType,
  makeInsightAnalyticsAction,
} from '../analytics/analytics-utils';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state';

export const logDidYouMeanClick = makeInsightAnalyticsAction(
  'analytics/didyoumean/click',
  AnalyticsType.Search,
  (client, state) =>
    client.logDidYouMeanClick(
      getCaseContextAnalyticsMetadata(state.insightCaseContext)
    )
);

export const logDidYouMeanAutomatic = makeInsightAnalyticsAction(
  'analytics/didyoumean/automatic',
  AnalyticsType.Search,
  (client, state) =>
    client.logDidYouMeanAutomatic(
      getCaseContextAnalyticsMetadata(state.insightCaseContext)
    )
);
