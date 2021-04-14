import {Result} from '../../api/search/search/result';
import {
  AnalyticsType,
  documentIdentifier,
  makeAnalyticsAction,
  partialDocumentInformation,
  validateResultPayload,
} from '../analytics/analytics-utils';

/**
 * Logs a document quickview click event.
 * @param result - The result that was previewed.
 */
export const logDocumentQuickview = (result: Result) => {
  return buildDocumentQuickviewThunk(result)();
};

export const buildDocumentQuickviewThunk = (result: Result) => {
  return makeAnalyticsAction(
    'analytics/resultPreview/open',
    AnalyticsType.Click,
    (client, state) => {
      validateResultPayload(result);
      const info = partialDocumentInformation(result, state);
      const id = documentIdentifier(result);
      return client.logDocumentQuickview(info, id);
    }
  );
};
