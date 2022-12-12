import {Result} from '../../insight.index';
import {
  AnalyticsType,
  documentIdentifier,
  makeInsightAnalyticsAction,
  partialDocumentInformation,
  validateResultPayload,
} from '../analytics/analytics-utils';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state';

export const logCopyToClipboard = (result: Result) =>
  makeInsightAnalyticsAction(
    'analytics/resultAction/insight/copyToClipboard',
    AnalyticsType.Click,
    (client, state) => {
      validateResultPayload(result);
      const metadata = getCaseContextAnalyticsMetadata(
        state.insightCaseContext
      );
      return client.logCopyToClipboard(
        partialDocumentInformation(result, state),
        documentIdentifier(result),
        metadata
      );
    }
  )();
