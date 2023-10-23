import {Result} from '../../api/search/search/result';
import {
  partialDocumentInformation,
  documentIdentifier,
  validateResultPayload,
  makeAnalyticsAction,
  ClickAction,
} from '../analytics/analytics-utils';

export const logDocumentOpen = (result: Result): ClickAction =>
  makeAnalyticsAction('analytics/result/open', (client, state) => {
    validateResultPayload(result);
    return client.makeDocumentOpen(
      partialDocumentInformation(result, state),
      documentIdentifier(result)
    );
  });
