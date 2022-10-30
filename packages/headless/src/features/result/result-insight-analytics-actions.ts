import {
  partialDocumentInformation,
  documentIdentifier,
  validateResultPayload,
  AnalyticsType,
  makeInsightAnalyticsAction,
} from '../analytics/analytics-utils';
import {Result} from '../../api/search/search/result';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state';

export const logDocumentOpen = (result: Result) =>
  makeInsightAnalyticsAction(
    'analytics/result/open',
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
  )();
