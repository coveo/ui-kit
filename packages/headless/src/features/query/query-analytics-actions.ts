import {
  makeAnalyticsAction,
  LegacySearchAction,
} from '../analytics/analytics-utils.js';
import {SearchPageEvents} from '../analytics/search-action-cause.js';
import {SearchAction} from '../search/search-actions.js';

//TODO: KIT-2859
export const logSearchboxSubmit = (): LegacySearchAction =>
  makeAnalyticsAction('analytics/searchbox/submit', (client) =>
    client.makeSearchboxSubmit()
  );

export const searchboxSubmit = (): SearchAction => ({
  actionCause: SearchPageEvents.searchboxSubmit,
});
