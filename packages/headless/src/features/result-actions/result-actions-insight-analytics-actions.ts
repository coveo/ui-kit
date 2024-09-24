import {InsightPanel} from '@coveo/relay-event-types';
import {Result} from '../../api/search/search/result';
import {
  analyticsEventItemMetadata,
  documentIdentifier,
  InsightAction,
  makeInsightAnalyticsActionFactory,
  partialDocumentInformation,
  validateResultPayload,
} from '../analytics/analytics-utils';
import {analyticsEventCaseContext} from '../analytics/insight-analytics-utils';
import {SearchPageEvents} from '../analytics/search-action-cause';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state';

export const logCopyToClipboard = (result: Result): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.copyToClipboard)({
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
      const information = partialDocumentInformation(result, state);
      return {
        itemMetadata: analyticsEventItemMetadata(result, state),
        position: information.documentPosition,
        searchUid: result.searchUid || '',
        action: 'copyToClipboard',
        context: analyticsEventCaseContext(state),
      };
    },
  });

export const logCaseSendEmail = (result: Result): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.caseSendEmail)({
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
      const information = partialDocumentInformation(result, state);
      return {
        itemMetadata: analyticsEventItemMetadata(result, state),
        position: information.documentPosition,
        searchUid: result.searchUid || '',
        action: 'sendEmail',
        context: analyticsEventCaseContext(state),
      };
    },
  });

export const logFeedItemTextPost = (result: Result): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.feedItemTextPost)({
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
      const information = partialDocumentInformation(result, state);
      return {
        itemMetadata: analyticsEventItemMetadata(result, state),
        position: information.documentPosition,
        searchUid: result.searchUid || '',
        action: 'postToFeed',
        context: analyticsEventCaseContext(state),
      };
    },
  });
