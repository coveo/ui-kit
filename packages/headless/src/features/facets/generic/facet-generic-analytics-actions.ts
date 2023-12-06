import {
  makeAnalyticsAction,
  SearchAction,
} from '../../analytics/analytics-utils';

//TODO: KIT-2859
export const logClearBreadcrumbs = (): SearchAction =>
  makeAnalyticsAction('analytics/facet/deselectAllBreadcrumbs', (client) => {
    return client.makeBreadcrumbResetAll();
  });
