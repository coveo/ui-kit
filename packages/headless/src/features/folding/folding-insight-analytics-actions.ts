import {Result} from '../../api/search/search/result';
import {
  documentIdentifier,
  InsightAction,
  makeInsightAnalyticsActionFactory,
  partialDocumentInformation,
  validateResultPayload,
} from '../analytics/analytics-utils';
import {SearchPageEvents} from '../analytics/search-action-cause';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state';

export const logShowMoreFoldedResults = (result: Result): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.showMoreFoldedResults)(
    'analytics/folding/showMore',
    (client, state) => {
      validateResultPayload(result);

      return client.logShowMoreFoldedResults(
        partialDocumentInformation(result, state),
        documentIdentifier(result),
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
    }
  );

export const logShowLessFoldedResults = (): InsightAction =>
  makeInsightAnalyticsActionFactory(SearchPageEvents.showLessFoldedResults)(
    'analytics/folding/showLess',
    (client, state) =>
      client.logShowLessFoldedResults(
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      )
  );

export const insightFoldedResultAnalyticsClient = {
  logShowMoreFoldedResults,
  logShowLessFoldedResults,
};
