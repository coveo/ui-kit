import {Result} from '../../api/search/search/result';
import {
  partialDocumentInformation,
  documentIdentifier,
  validateResultPayload,
  AnalyticsType,
  ClickAction,
} from '../analytics/analytics-utils';
import {makeAnalyticsAction} from '../analytics/search-analytics-utils';

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
