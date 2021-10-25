import {
  AnalyticsType,
  makeAnalyticsAction,
} from '../../analytics/analytics-utils';

/**
 * Logs clear all breadcrumbs event e.g. when a user click to remove all filters at once
 */
export const logClearBreadcrumbs = () =>
  makeAnalyticsAction(
    'analytics/facet/deselectAllBreadcrumbs',
    AnalyticsType.Search,
    (client) => {
      return client.logBreadcrumbResetAll();
    }
  )();
