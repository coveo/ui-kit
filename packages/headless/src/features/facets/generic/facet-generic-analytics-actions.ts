import {
  makeAnalyticsAction,
  AnalyticsType,
} from '../../analytics/analytics-actions';

export const logClearBreadcrumbs = () =>
  makeAnalyticsAction(
    'analytics/facet/clearAllValues',
    AnalyticsType.Search,
    (client) => {
      return client.logBreadcrumbResetAll();
    }
  )();
