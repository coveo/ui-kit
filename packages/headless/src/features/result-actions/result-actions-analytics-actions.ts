import {Result} from '../../api/search/search/result';
import {
  AnalyticsType,
  documentIdentifier,
  makeAnalyticsAction,
  partialDocumentInformation,
  validateResultPayload,
} from '../analytics/analytics-utils';

export const logCopyToClipboard = (result: Result) =>
  makeAnalyticsAction(
    'analytics/resultAction/copyToClipboard',
    AnalyticsType.Click,
    (client, state) => {
      validateResultPayload(result);
      return client.logCopyToClipboard(
        partialDocumentInformation(result, state),
        documentIdentifier(result)
      );
    }
  )();
