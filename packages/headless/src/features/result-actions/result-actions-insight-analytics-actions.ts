import {Result} from '../../insight.index';
import {
  AnalyticsType,
  documentIdentifier,
  InsightAction,
  makeInsightAnalyticsAction,
  partialDocumentInformation,
  validateResultPayload,
} from '../analytics/analytics-utils';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state';

export const logCopyToClipboard = (
  result: Result
): InsightAction<AnalyticsType.Click> =>
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
  );
