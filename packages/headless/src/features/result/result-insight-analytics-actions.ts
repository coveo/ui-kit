import {InsightPanel} from '@coveo/relay-event-types';
import {Result} from '../../api/search/search/result';
import {
  partialDocumentInformation,
  documentIdentifier,
  validateResultPayload,
  makeInsightAnalyticsActionFactory,
  analyticsEventItemMetadata,
} from '../analytics/analytics-utils';
import {analyticsEventCaseContext} from '../analytics/insight-analytics-utils';
import {SearchPageEvents} from '../analytics/search-action-cause';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state';

export const logDocumentOpen = (result: Result) =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.documentOpen)({
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
      const information = partialDocumentInformation(result, state);
      return {
        itemMetadata: analyticsEventItemMetadata(result, state),
        position: information.documentPosition,
        searchUid: result.searchUid || '',
        action: 'open',
        context: analyticsEventCaseContext(state),
      };
    },
  });
