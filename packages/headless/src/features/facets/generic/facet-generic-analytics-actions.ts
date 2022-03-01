import {
  AnalyticsType,
  makeAnalyticsAction,
} from '../../analytics/analytics-utils';

export const logClearBreadcrumbs = () =>
  makeAnalyticsAction(
    'analytics/facet/deselectAllBreadcrumbs',
    AnalyticsType.Search,
    (client) => {
      return client.logBreadcrumbResetAll();
    }
  )();
