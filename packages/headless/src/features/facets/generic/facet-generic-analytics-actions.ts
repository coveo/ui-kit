import {
  makeAnalyticsAction,
  AnalyticsType,
} from '../../analytics/analytics-actions';

/**
 * Logs clear all breadcrumbs event e.g. when a user click to remove all filters at once
 */
export const logClearBreadcrumbs = () =>
  makeAnalyticsAction(
    'analytics/facet/clearAllValues',
    AnalyticsType.Search,
    (client) => {
      return client.logBreadcrumbResetAll();
    }
  )();
