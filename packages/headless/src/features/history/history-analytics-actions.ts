import {SearchPageEvents as LegacySearchPageEvents} from 'coveo.analytics/dist/definitions/searchPage/searchPageEvents';
import {SearchAnalyticsProvider} from '../../api/analytics/search-analytics';
import {
  makeAnalyticsAction,
  LegacySearchAction,
} from '../analytics/analytics-utils';
import {SearchPageEvents} from '../analytics/search-action-cause';
import {SearchAction} from '../search/search-actions';

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
export const historyForward = (): SearchAction => {
  return {
    actionCause: SearchPageEvents.historyForward,
    getEventExtraPayload: (state) =>
      new SearchAnalyticsProvider(() => state).getBaseMetadata(),
  };
};

export const historyBackward = (): SearchAction => {
  return {
    actionCause: SearchPageEvents.historyBackward,
    getEventExtraPayload: (state) =>
      new SearchAnalyticsProvider(() => state).getBaseMetadata(),
  };
};

export const noResultsBack = (): SearchAction => {
  return {
    actionCause: SearchPageEvents.noResultsBack,
    getEventExtraPayload: (state) =>
      new SearchAnalyticsProvider(() => state).getBaseMetadata(),
  };
};
