import {SearchPageEvents} from 'coveo.analytics/dist/definitions/searchPage/searchPageEvents';
import {AnalyticsType, makeAnalyticsAction} from '../analytics/analytics-utils';

export const logNavigateForward = makeAnalyticsAction(
  'history/analytics/forward',
  AnalyticsType.Search,
  (client) => client.logSearchEvent('historyForward' as SearchPageEvents) // TODO: Need to create this event natively in coveo.analytics to remove cast
);

export const logNavigateBackward = makeAnalyticsAction(
  'history/analytics/backward',
  AnalyticsType.Search,
  (client) => client.logSearchEvent('historyBackward' as SearchPageEvents) // TODO: Need to create this event natively in coveo.analytics to remove cast
);

export const logNoResultsBack = makeAnalyticsAction(
  'history/analytics/noresultsback',
  AnalyticsType.Search,
  (client) => client.logNoResultsBack()
);
