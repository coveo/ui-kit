import {
  makeAnalyticsAction,
  SearchAction,
} from '../../analytics/analytics-utils';

export const logClearBreadcrumbs = (): SearchAction =>
  makeAnalyticsAction('analytics/facet/deselectAllBreadcrumbs', (client) => {
    return client.makeBreadcrumbResetAll();
  });
