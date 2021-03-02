import {
  partialDocumentInformation,
  documentIdentifier,
  validateResultPayload,
  makeAnalyticsAction,
  AnalyticsType,
} from '../analytics/analytics-utils';
import {Result} from '../../api/search/search/result';

export const logDocumentOpenThunk = (result: Result) =>
  makeAnalyticsAction(
    'analytics/result/open',
    AnalyticsType.Click,
    (client, state) => {
      validateResultPayload(result);
      return client.logDocumentOpen(
        partialDocumentInformation(result, state),
        documentIdentifier(result)
      );
    }
  );

/**
 * Logs a click event with an `actionCause` value of `documentOpen`.
 * @param result (Result) The result that was opened.
 */
export const logDocumentOpen = (result: Result) =>
  logDocumentOpenThunk(result)();
