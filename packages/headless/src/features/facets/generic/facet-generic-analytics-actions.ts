import {
  makeAnalyticsAction,
  LegacySearchAction,
} from '../../analytics/analytics-utils';

//TODO: KIT-2859
export const logClearBreadcrumbs = (): LegacySearchAction =>
  makeAnalyticsAction('analytics/facet/deselectAllBreadcrumbs', (client) => {
    return client.makeBreadcrumbResetAll();
  });
