import {AnalyticsType} from '../../analytics/analytics-utils';
import {
  InsightAction,
  makeInsightAnalyticsAction,
} from '../../analytics/insight-analytics-utils';
import {getCaseContextAnalyticsMetadata} from '../../case-context/case-context-state';

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
