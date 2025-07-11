import type {Result} from '../../api/search/search/result.js';
import {
  documentIdentifier,
  type InsightAction,
  makeInsightAnalyticsActionFactory,
  partialDocumentInformation,
  validateResultPayload,
} from '../analytics/analytics-utils.js';
import {SearchPageEvents} from '../analytics/search-action-cause.js';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state.js';

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
