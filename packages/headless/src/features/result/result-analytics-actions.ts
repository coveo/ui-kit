import {Result} from '../../api/search/search/result.js';
import {
  partialDocumentInformation,
  documentIdentifier,
  validateResultPayload,
  makeAnalyticsAction,
  AnalyticsType,
  ClickAction,
} from '../analytics/analytics-utils.js';

export const logDocumentOpen = (result: Result): ClickAction =>
  makeAnalyticsAction(
    'analytics/result/open',
    AnalyticsType.Click,
    (client, state) => {
      validateResultPayload(result);
      return client.makeDocumentOpen(
        partialDocumentInformation(result, state),
        documentIdentifier(result)
      );
    }
  );
