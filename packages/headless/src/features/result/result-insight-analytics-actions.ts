import {Result} from '../../api/search/search/result';
import {
  partialDocumentInformation,
  documentIdentifier,
  validateResultPayload,
  AnalyticsType,
  makeInsightAnalyticsAction,
} from '../analytics/analytics-utils';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state';

export const logDocumentOpenThunk = (result: Result) =>
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

export const logDocumentOpen = (result: Result) =>
  logDocumentOpenThunk(result)();
