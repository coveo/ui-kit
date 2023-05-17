import {Result} from '../../insight.index';
import {
  AnalyticsType,
  documentIdentifier,
  partialDocumentInformation,
  validateResultPayload,
} from '../analytics/analytics-utils';
import {
  InsightAction,
  makeInsightAnalyticsAction,
} from '../analytics/insight-analytics-utils';
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
