import {
  AnalyticsType,
  makeAnalyticsAction,
  makeInsightAnalyticsAction,
} from '../../analytics/analytics-utils';

export const logClearBreadcrumbs = () =>
  makeAnalyticsAction(
    'analytics/facet/deselectAllBreadcrumbs',
    AnalyticsType.Search,
    (client) => {
      return client.logBreadcrumbResetAll();
    }
  )();

export const logInsightClearBreadcrumbs = () =>
  makeInsightAnalyticsAction(
    'analytics/facet/deselectAllBreadcrumbs',
    AnalyticsType.Search,
    (client) => {
      return client.logBreadcrumbResetAll();
    }
  )();
