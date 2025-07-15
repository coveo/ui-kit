import {
  type LegacySearchAction,
  makeAnalyticsAction,
} from '../../analytics/analytics-utils.js';

//TODO: KIT-2859
export const logClearBreadcrumbs = (): LegacySearchAction =>
  makeAnalyticsAction('analytics/facet/deselectAllBreadcrumbs', (client) => {
    return client.makeBreadcrumbResetAll();
  });
