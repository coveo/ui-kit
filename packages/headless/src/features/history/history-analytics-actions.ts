import {SearchPageEvents} from 'coveo.analytics/dist/definitions/searchPage/searchPageEvents';
import {
  AnalyticsType,
  makeAnalyticsAction,
  SearchAction,
} from '../analytics/analytics-utils';

export const logNavigateForward = (): SearchAction =>
  makeAnalyticsAction(
    'history/analytics/forward',
    AnalyticsType.Search,
    (client) => client.makeSearchEvent('historyForward' as SearchPageEvents) // TODO: Need to create this event natively in coveo.analytics to remove cast
  );

export const logNavigateBackward = (): SearchAction =>
  makeAnalyticsAction(
    'history/analytics/backward',
    AnalyticsType.Search,
    (client) => client.makeSearchEvent('historyBackward' as SearchPageEvents) // TODO: Need to create this event natively in coveo.analytics to remove cast
  );

export const logNoResultsBack = (): SearchAction =>
  makeAnalyticsAction(
    'history/analytics/noresultsback',
    AnalyticsType.Search,
    (client) => client.makeNoResultsBack()
  );
