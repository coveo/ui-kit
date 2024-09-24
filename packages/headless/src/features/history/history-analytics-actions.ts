import {SearchPageEvents as LegacySearchPageEvents} from 'coveo.analytics/dist/definitions/searchPage/searchPageEvents.js';
import {
  makeAnalyticsAction,
  LegacySearchAction,
} from '../analytics/analytics-utils.js';
import {SearchPageEvents} from '../analytics/search-action-cause.js';
import {SearchAction} from '../search/search-actions.js';

//TODO: KIT-2859
export const logNavigateForward = (): LegacySearchAction =>
  makeAnalyticsAction(
    'history/analytics/forward',
    (client) =>
      client.makeSearchEvent('historyForward' as LegacySearchPageEvents) // TODO: Need to create this event natively in coveo.analytics to remove cast
  );

//TODO: KIT-2859
export const logNavigateBackward = (): LegacySearchAction =>
  makeAnalyticsAction(
    'history/analytics/backward',
    (client) =>
      client.makeSearchEvent('historyBackward' as LegacySearchPageEvents) // TODO: Need to create this event natively in coveo.analytics to remove cast
  );

//TODO: KIT-2859
export const logNoResultsBack = (): LegacySearchAction =>
  makeAnalyticsAction('history/analytics/noresultsback', (client) =>
    client.makeNoResultsBack()
  );

// --------------------- KIT-2859 : Everything above this will get deleted ! :) ---------------------
export const historyForward = (): SearchAction => ({
  actionCause: SearchPageEvents.historyForward,
});

export const historyBackward = (): SearchAction => ({
  actionCause: SearchPageEvents.historyBackward,
});

export const noResultsBack = (): SearchAction => ({
  actionCause: SearchPageEvents.noResultsBack,
});
