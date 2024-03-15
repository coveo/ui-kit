import {InsightPanel} from '@coveo/relay-event-types';
import {Result} from '../../api/search/search/result';
import {
  analyticsEventItemMetadata,
  documentIdentifier,
  makeInsightAnalyticsActionFactory,
  partialDocumentInformation,
  validateResultPayload,
} from '../analytics/analytics-utils';
import {analyticsEventCaseContext} from '../analytics/insight-analytics-utils';
import {SearchPageEvents} from '../analytics/search-action-cause';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state';

export const logCaseAttach = (result: Result) =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.caseAttach)({
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
    analyticsType: 'InsightPanel.ItemAction',
    analyticsPayloadBuilder: (state): InsightPanel.ItemAction => {
      const information = partialDocumentInformation(result, state);
      return {
        itemMetadata: analyticsEventItemMetadata(result, state),
        position: information.documentPosition,
        searchUid: state.search?.response.searchUid || '',
        action: 'attach',
        context: analyticsEventCaseContext(state),
      };
    },
  });

export const logCaseDetach = (result: Result) =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.caseDetach)({
    prefix: 'insight/caseDetach',
    __legacy__getBuilder: (client, state) => {
      return client.logCaseDetach(
        result.raw.urihash,
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
    },
    analyticsType: 'InsightPanel.DetachItem',
    analyticsPayloadBuilder: (state): InsightPanel.DetachItem => {
      return {
        itemMetadata: analyticsEventItemMetadata(result, state),
        context: analyticsEventCaseContext(state),
      };
    },
  });
