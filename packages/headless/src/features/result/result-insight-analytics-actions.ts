import {Result} from '../../api/search/search/result.js';
import {
  partialDocumentInformation,
  documentIdentifier,
  validateResultPayload,
  AnalyticsType,
  makeInsightAnalyticsAction,
} from '../analytics/analytics-utils.js';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state.js';

export const logDocumentOpen = (result: Result) =>
  makeInsightAnalyticsAction(
    'analytics/insight/result/open',
    AnalyticsType.Click,
    (client, state) => {
      validateResultPayload(result);
      const metadata = getCaseContextAnalyticsMetadata(
        state.insightCaseContext
      );
      return client.logDocumentOpen(
        partialDocumentInformation(result, state),
        documentIdentifier(result),
        metadata
      );
    }
  );
