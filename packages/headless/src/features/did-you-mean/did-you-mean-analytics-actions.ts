import {
  type LegacySearchAction,
  makeAnalyticsAction,
} from '../analytics/analytics-utils.js';
import {SearchPageEvents} from '../analytics/search-action-cause.js';
import type {SearchAction} from '../search/search-actions.js';

//TODO: KIT-2859
export const logDidYouMeanClick = (): LegacySearchAction =>
  makeAnalyticsAction('analytics/didyoumean/click', (client) =>
    client.makeDidYouMeanClick()
  );

//TODO: KIT-2859
export const logDidYouMeanAutomatic = (): LegacySearchAction =>
  makeAnalyticsAction('analytics/didyoumean/automatic', (client) =>
    client.makeDidYouMeanAutomatic()
  );

export const didYouMeanClick = (): SearchAction => ({
  actionCause: SearchPageEvents.didYouMeanClick,
});

export const didYouMeanAutomatic = (): SearchAction => ({
  actionCause: SearchPageEvents.didYouMeanAutomatic,
});
