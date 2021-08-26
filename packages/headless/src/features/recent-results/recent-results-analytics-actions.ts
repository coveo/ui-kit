import {Result} from '../../api/search/search/result';
import {
  makeAnalyticsAction,
  AnalyticsType,
  partialDocumentInformation,
  documentIdentifier,
  validateResultPayload,
} from '../analytics/analytics-utils';

export const logRecentResultClickThunk = (result: Result) =>
  makeAnalyticsAction(
    'analytics/recentResults/click',
    AnalyticsType.Custom,
    (client, state) => {
      validateResultPayload(result);
      client.logRecentResultClick(
        partialDocumentInformation(result, state),
        documentIdentifier(result)
      );
    }
  );

/**
 * Logs a custom event with an `actionCause` value of `recentResultClick`.
 */
export const logRecentResultClick = (result: Result) =>
  logRecentResultClickThunk(result)();

/**
 * Logs a custom event with an `actionCause` value of `clearRecentResults`.
 */
export const logClearRecentResults = makeAnalyticsAction(
  'analytics/recentResults/clear',
  AnalyticsType.Custom,
  (client) => client.logClearRecentResults()
);
