import {InsightPanel} from '@coveo/relay-event-types';
import {Result} from '../../api/search/search/result';
import {
  ClickAction,
  analyticsEventItemMetadata,
  documentIdentifier,
  makeInsightAnalyticsActionFactory,
  partialDocumentInformation,
  validateResultPayload,
} from '../analytics/analytics-utils';
import {analyticsEventCaseContext} from '../analytics/insight-analytics-utils';

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
        searchUid: state.search?.response.searchUid || '',
        context: analyticsEventCaseContext(state),
      };
    },
  });
};
