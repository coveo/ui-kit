import {InsightPanel} from '@coveo/relay-event-types';
import {Result} from '../../api/search/search/result';
import {
  partialDocumentInformation,
  documentIdentifier,
  validateResultPayload,
  makeInsightAnalyticsAction,
} from '../analytics/analytics-utils';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state';

export const logDocumentOpen = (result: Result) =>
  makeInsightAnalyticsAction({
    prefix: 'analytics/insight/result/open',
    __legacy__getBuilder: (client, state) => {
      validateResultPayload(result);
      const metadata = getCaseContextAnalyticsMetadata(
        state.insightCaseContext
      );
      return client.logDocumentOpen(
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
        action: 'open',
        context: {
          targetId: metadata.caseId || '',
          targetType: 'Case',
        },
      };
    },
  });
