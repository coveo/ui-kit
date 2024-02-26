import {InsightPanel} from '@coveo/relay-event-types';
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
  makeInsightAnalyticsAction({
    prefix: 'analytics/resultAction/insight/copyToClipboard',
    __legacy__getBuilder: (client, state) => {
      validateResultPayload(result);
      const metadata = getCaseContextAnalyticsMetadata(
        state.insightCaseContext
      );
      return client.logCopyToClipboard(
        partialDocumentInformation(result, state),
        documentIdentifier(result),
        metadata
      );
    },
    analyticsType: 'InsightPanel.ItemAction',
    analyticsPayloadBuilder: (state): InsightPanel.ItemAction => {
      const metadata = getCaseContextAnalyticsMetadata(
        state.insightCaseContext
      );
      const identifier = documentIdentifier(result);
      const information = partialDocumentInformation(result, state);
      return {
        itemMetadata: {
          uniqueFieldName: identifier.contentIDKey,
          uniqueFieldValue: identifier.contentIDValue,
          title: information.documentTitle,
          author: information.documentAuthor,
          url: information.documentUri,
        },
        position: information.documentPosition,
        searchUid: state.search?.response.searchUid || '',
        action: 'copyToClipboard',
        context: {
          targetId: metadata.caseId || '',
          targetType: 'Case',
          caseNumber: metadata.caseNumber,
        } as InsightPanel.Context,
      };
    },
  });

export const logCaseSendEmail = (result: Result): InsightAction =>
  makeInsightAnalyticsAction({
    prefix: 'analytics/resultAction/insight/caseSendEmail',
    __legacy__getBuilder: (client, state) => {
      validateResultPayload(result);
      const metadata = getCaseContextAnalyticsMetadata(
        state.insightCaseContext
      );
      return client.logCaseSendEmail(
        partialDocumentInformation(result, state),
        documentIdentifier(result),
        metadata
      );
    },
    analyticsType: 'InsightPanel.ItemAction',
    analyticsPayloadBuilder: (state): InsightPanel.ItemAction => {
      const metadata = getCaseContextAnalyticsMetadata(
        state.insightCaseContext
      );
      const identifier = documentIdentifier(result);
      const information = partialDocumentInformation(result, state);
      return {
        itemMetadata: {
          uniqueFieldName: identifier.contentIDKey,
          uniqueFieldValue: identifier.contentIDValue,
          title: information.documentTitle,
          author: information.documentAuthor,
          url: information.documentUri,
        },
        position: information.documentPosition,
        searchUid: state.search?.response.searchUid || '',
        action: 'sendEmail',
        context: {
          targetId: metadata.caseId || '',
          targetType: 'Case',
          caseNumber: metadata.caseNumber,
        } as InsightPanel.Context,
      };
    },
  });

export const logFeedItemTextPost = (result: Result): InsightAction =>
  makeInsightAnalyticsAction({
    prefix: 'analytics/resultAction/insight/feedItemTextPost',
    __legacy__getBuilder: (client, state) => {
      validateResultPayload(result);
      const metadata = getCaseContextAnalyticsMetadata(
        state.insightCaseContext
      );
      return client.logFeedItemTextPost(
        partialDocumentInformation(result, state),
        documentIdentifier(result),
        metadata
      );
    },
    analyticsType: 'InsightPanel.ItemAction',
    analyticsPayloadBuilder: (state): InsightPanel.ItemAction => {
      const metadata = getCaseContextAnalyticsMetadata(
        state.insightCaseContext
      );
      const identifier = documentIdentifier(result);
      const information = partialDocumentInformation(result, state);
      return {
        itemMetadata: {
          uniqueFieldName: identifier.contentIDKey,
          uniqueFieldValue: identifier.contentIDValue,
          title: information.documentTitle,
          author: information.documentAuthor,
          url: information.documentUri,
        },
        position: information.documentPosition,
        searchUid: state.search?.response.searchUid || '',
        action: 'postToFeed',
        context: {
          targetId: metadata.caseId || '',
          targetType: 'Case',
          caseNumber: metadata.caseNumber,
        } as InsightPanel.Context,
      };
    },
  });
