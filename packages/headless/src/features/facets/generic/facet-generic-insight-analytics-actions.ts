import {
  AnalyticsType,
  InsightAction,
  makeInsightAnalyticsAction,
} from '../../analytics/analytics-utils.js';
import {getCaseContextAnalyticsMetadata} from '../../case-context/case-context-state.js';

export const logClearBreadcrumbs = (): InsightAction =>
  makeInsightAnalyticsAction(
    'analytics/facet/deselectAllBreadcrumbs',
    AnalyticsType.Search,
    (client, state) => {
      return client.logBreadcrumbResetAll(
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
    }
  );
