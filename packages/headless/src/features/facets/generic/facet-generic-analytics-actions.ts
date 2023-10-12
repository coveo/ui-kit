import {
  AnalyticsType,
  makeAnalyticsAction,
  SearchAction,
} from '../../analytics/analytics-utils.js';

export const logClearBreadcrumbs = (): SearchAction =>
  makeAnalyticsAction(
    'analytics/facet/deselectAllBreadcrumbs',
    AnalyticsType.Search,
    (client) => {
      return client.makeBreadcrumbResetAll();
    }
  );
