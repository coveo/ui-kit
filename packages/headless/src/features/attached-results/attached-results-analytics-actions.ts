import {InsightPanel} from '@coveo/relay-event-types';
import {Result} from '../../api/search/search/result';
import {
  documentIdentifier,
  makeInsightAnalyticsAction,
  partialDocumentInformation,
  validateResultPayload,
} from '../analytics/analytics-utils';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state';

export const logCaseAttach = (result: Result) =>
  makeInsightAnalyticsAction({
    prefix: 'insight/caseAttach',
    __legacy__getBuilder: (client, state) => {
      validateResultPayload(result);
      const metadata = getCaseContextAnalyticsMetadata(
        state.insightCaseContext
      );
      return client.logCaseAttach(
        partialDocumentInformation(result, state),
        documentIdentifier(result),
        metadata
      );
    },
    analyticsType: 'ItemAction',
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
        action: 'attach',
        context: {
          targetId: metadata.caseId || '',
          targetType: 'Case',
          caseNumber: metadata.caseNumber,
        } as InsightPanel.Context,
      };
    },
  });

export const logCaseDetach = (result: Result) =>
  makeInsightAnalyticsAction({
    prefix: 'insight/caseDetach',
    __legacy__getBuilder: (client, state) => {
      return client.logCaseDetach(
        result.raw.urihash,
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
    },
    analyticsType: 'DetachItem',
    analyticsPayloadBuilder: (state): InsightPanel.DetachItem => {
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
        context: {
          targetId: metadata.caseId || '',
          targetType: 'Case',
          caseNumber: metadata.caseNumber,
        } as InsightPanel.Context,
      };
    },
  });
