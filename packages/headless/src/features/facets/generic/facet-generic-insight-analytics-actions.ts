import {
  AnalyticsType,
  makeInsightAnalyticsAction,
} from '../../analytics/analytics-utils';

export const logClearBreadcrumbs = () =>
  makeInsightAnalyticsAction(
    'analytics/facet/deselectAllBreadcrumbs',
    AnalyticsType.Search,
    (client) => {
      return client.logBreadcrumbResetAll();
    }
  )();
