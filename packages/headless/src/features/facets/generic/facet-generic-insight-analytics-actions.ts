import {
  InsightAction,
  makeInsightAnalyticsAction,
} from '../../analytics/analytics-utils';
import {getCaseContextAnalyticsMetadata} from '../../case-context/case-context-state';

export const logClearBreadcrumbs = (): InsightAction =>
  makeInsightAnalyticsAction(
    'analytics/facet/deselectAllBreadcrumbs',
    (client, state) => {
      return client.logBreadcrumbResetAll(
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
    }
  );
