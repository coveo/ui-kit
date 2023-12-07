import {SearchAnalyticsProvider} from '../../../api/analytics/search-analytics';
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

export const breadcrumbResetAll = (): SearchAction => {
  return {
    actionCause: SearchPageEvents.breadcrumbResetAll,
    getEventExtraPayload: (state) =>
      new SearchAnalyticsProvider(() => state).getBaseMetadata(),
  };
};
