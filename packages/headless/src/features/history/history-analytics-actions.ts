import {SearchPageEvents} from 'coveo.analytics/dist/definitions/searchPage/searchPageEvents';
import {makeAnalyticsAction, SearchAction} from '../analytics/analytics-utils';

//TODO: KIT-2859
export const logNavigateForward = (): SearchAction =>
  makeAnalyticsAction(
    'history/analytics/forward',
    (client) => client.makeSearchEvent('historyForward' as SearchPageEvents) // TODO: Need to create this event natively in coveo.analytics to remove cast
  );

//TODO: KIT-2859
export const logNavigateBackward = (): SearchAction =>
  makeAnalyticsAction(
    'history/analytics/backward',
    (client) => client.makeSearchEvent('historyBackward' as SearchPageEvents) // TODO: Need to create this event natively in coveo.analytics to remove cast
  );

//TODO: KIT-2859
export const logNoResultsBack = (): SearchAction =>
  makeAnalyticsAction('history/analytics/noresultsback', (client) =>
    client.makeNoResultsBack()
  );
