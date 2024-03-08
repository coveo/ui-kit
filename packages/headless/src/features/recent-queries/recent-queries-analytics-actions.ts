import {
  makeAnalyticsAction,
  CustomAction,
  LegacySearchAction,
} from '../analytics/analytics-utils';
import {SearchPageEvents} from '../analytics/search-action-cause';
import {SearchAction} from '../search/search-actions';

export const logClearRecentQueries = (): CustomAction =>
  makeAnalyticsAction('analytics/recentQueries/clear', (client) => {
    return client.makeClearRecentQueries();
  });

//TODO: KIT-2859
export const logRecentQueryClick = (): LegacySearchAction =>
  makeAnalyticsAction('analytics/recentQueries/click', (client) => {
    return client.makeRecentQueryClick();
  });

export const recentQueryClick = (): SearchAction => ({
  actionCause: SearchPageEvents.recentQueryClick,
});
