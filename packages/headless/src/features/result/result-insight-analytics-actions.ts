import {InsightPanel} from '@coveo/relay-event-types';
import {Result} from '../../api/search/search/result.js';
import {
  partialDocumentInformation,
  documentIdentifier,
  validateResultPayload,
  makeInsightAnalyticsActionFactory,
  analyticsEventItemMetadata,
} from '../analytics/analytics-utils.js';
import {analyticsEventCaseContext} from '../analytics/insight-analytics-utils.js';
import {SearchPageEvents} from '../analytics/search-action-cause.js';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state.js';

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
