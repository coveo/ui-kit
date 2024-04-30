import {
  ProductListingV2Action,
  makeCommerceAnalyticsAction,
} from '../../analytics/analytics-utils';
import {SearchPageEvents} from '../../analytics/search-action-cause';
import {SearchAction} from '../../search/search-actions';

export const logClearRecentQueries = (): ProductListingV2Action =>
  makeCommerceAnalyticsAction('analytics/recentQueries/clear', (client) => {
    return client.makeClearRecentQueries();
  });

export const recentQueryClick = (): SearchAction => ({
  actionCause: SearchPageEvents.recentQueryClick,
});
