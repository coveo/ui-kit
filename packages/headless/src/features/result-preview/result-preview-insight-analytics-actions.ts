import {InsightPanel} from '@coveo/relay-event-types';
import {Result} from '../../api/search/search/result.js';
import {
  ClickAction,
  analyticsEventItemMetadata,
  documentIdentifier,
  makeInsightAnalyticsActionFactory,
  partialDocumentInformation,
  validateResultPayload,
} from '../analytics/analytics-utils.js';
import {analyticsEventCaseContext} from '../analytics/insight-analytics-utils.js';

export const logDocumentQuickview = (result: Result): ClickAction => {
  return makeInsightAnalyticsActionFactory('')({
    prefix: 'analytics/resultPreview/open',
    __legacy__getBuilder: (client, state) => {
      validateResultPayload(result);
      const info = partialDocumentInformation(result, state);
      const id = documentIdentifier(result);
      client.logDocumentQuickview(info, id);
    },
    analyticsType: 'InsightPanel.ItemAction',
    analyticsPayloadBuilder: (state): InsightPanel.ItemAction => {
      const information = partialDocumentInformation(result, state);
      return {
        action: 'preview',
        itemMetadata: analyticsEventItemMetadata(result, state),
        position: information.documentPosition,
        searchUid: result.searchUid || '',
        context: analyticsEventCaseContext(state),
      };
    },
  });
};
