import {Result} from '../../api/search/search/result';
import {
  documentIdentifier,
  InsightAction,
  makeInsightAnalyticsAction,
  partialDocumentInformation,
  validateResultPayload,
} from '../analytics/analytics-utils';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state';

export const logCopyToClipboard = (result: Result): InsightAction =>
  makeInsightAnalyticsAction(
    'analytics/resultAction/insight/copyToClipboard',
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

export const logCaseSendEmail = (result: Result): InsightAction =>
  makeInsightAnalyticsAction(
    'analytics/resultAction/insight/caseSendEmail',
    (client, state) => {
      validateResultPayload(result);
      const metadata = getCaseContextAnalyticsMetadata(
        state.insightCaseContext
      );
      return client.logCaseSendEmail(
        partialDocumentInformation(result, state),
        documentIdentifier(result),
        metadata
      );
    }
  );

export const logFeedItemTextPost = (result: Result): InsightAction =>
  makeInsightAnalyticsAction(
    'analytics/resultAction/insight/feedItemTextPost',
    (client, state) => {
      validateResultPayload(result);
      const metadata = getCaseContextAnalyticsMetadata(
        state.insightCaseContext
      );
      return client.logFeedItemTextPost(
        partialDocumentInformation(result, state),
        documentIdentifier(result),
        metadata
      );
    }
  );
