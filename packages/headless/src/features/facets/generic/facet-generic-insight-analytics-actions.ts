import {
  type InsightAction,
  makeInsightAnalyticsActionFactory,
} from '../../analytics/analytics-utils.js';
import {SearchPageEvents} from '../../analytics/search-action-cause.js';
import {getCaseContextAnalyticsMetadata} from '../../case-context/case-context-state.js';

export const logClearBreadcrumbs = (): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.breadcrumbResetAll)(
    'analytics/facet/deselectAllBreadcrumbs',
    (client, state) => {
      return client.logBreadcrumbResetAll(
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
    }
  );
