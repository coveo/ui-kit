import {Result} from '../../api/search/search/result';
import {
  partialDocumentInformation,
  documentIdentifier,
  validateResultPayload,
  makeAnalyticsAction,
  AnalyticsType,
} from '../analytics/analytics-utils';

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

export const logDocumentOpen = (result: Result) =>
  logDocumentOpenThunk(result)();
