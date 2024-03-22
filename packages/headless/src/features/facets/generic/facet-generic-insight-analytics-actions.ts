import {
  InsightAction,
  makeInsightAnalyticsActionFactory,
} from '../../analytics/analytics-utils';
import {SearchPageEvents} from '../../analytics/search-action-cause';
import {getCaseContextAnalyticsMetadata} from '../../case-context/case-context-state';

export const logClearBreadcrumbs = (): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.breadcrumbResetAll)(
    'analytics/facet/deselectAllBreadcrumbs',
    (client, state) => {
      return client.logBreadcrumbResetAll(
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
    }
  );
