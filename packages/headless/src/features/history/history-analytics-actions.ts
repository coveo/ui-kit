import {SearchPageEvents} from 'coveo.analytics/dist/definitions/searchPage/searchPageEvents';
import {makeAnalyticsAction, SearchAction} from '../analytics/analytics-utils';

export const logNavigateForward = (): SearchAction =>
  makeAnalyticsAction(
    'history/analytics/forward',
    (client) => client.makeSearchEvent('historyForward' as SearchPageEvents) // TODO: Need to create this event natively in coveo.analytics to remove cast
  );

export const logNavigateBackward = (): SearchAction =>
  makeAnalyticsAction(
    'history/analytics/backward',
    (client) => client.makeSearchEvent('historyBackward' as SearchPageEvents) // TODO: Need to create this event natively in coveo.analytics to remove cast
  );

export const logNoResultsBack = (): SearchAction =>
  makeAnalyticsAction('history/analytics/noresultsback', (client) =>
    client.makeNoResultsBack()
  );
