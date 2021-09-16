import {SearchPageEvents} from 'coveo.analytics/dist/definitions/searchPage/searchPageEvents';
import {AnalyticsType, makeAnalyticsAction} from '../analytics/analytics-utils';

/**
 * Logs an event which represents a move forward in the interface history.
 */
export const logNavigateForward = makeAnalyticsAction(
  'history/analytics/forward',
  AnalyticsType.Search,
  (client) => client.logSearchEvent('historyForward' as SearchPageEvents) // TODO: Need to create this event natively in coveo.analytics to remove cast
);

/**
 * Logs an event which represents a move backward in the interface history.
 */
export const logNavigateBackward = makeAnalyticsAction(
  'history/analytics/backward',
  AnalyticsType.Search,
  (client) => client.logSearchEvent('historyBackward' as SearchPageEvents) // TODO: Need to create this event natively in coveo.analytics to remove cast
);

/**
 * Logs an event which represents when no results is shown and the end users cancel last action.
 */
export const logNoResultsBack = makeAnalyticsAction(
  'history/analytics/noresultsback',
  AnalyticsType.Search,
  (client) => client.logNoResultsBack()
);
