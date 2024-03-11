import {
  makeAnalyticsAction,
  LegacySearchAction,
} from '../../analytics/analytics-utils';
import {SearchPageEvents} from '../../analytics/search-action-cause';
import {SearchAction} from '../../search/search-actions';

//TODO: KIT-2859
export const logClearBreadcrumbs = (): LegacySearchAction =>
  makeAnalyticsAction('analytics/facet/deselectAllBreadcrumbs', (client) => {
    return client.makeBreadcrumbResetAll();
  });

export const breadcrumbResetAll = (): SearchAction => ({
  actionCause: SearchPageEvents.breadcrumbResetAll,
});
