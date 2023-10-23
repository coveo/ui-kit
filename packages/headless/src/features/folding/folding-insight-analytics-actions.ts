import {Result} from '../../api/search/search/result';
import {
  documentIdentifier,
  InsightAction,
  makeInsightAnalyticsAction,
  partialDocumentInformation,
  validateResultPayload,
} from '../analytics/analytics-utils';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state';

export const logShowMoreFoldedResults = (result: Result): InsightAction =>
  makeInsightAnalyticsAction('analytics/folding/showMore', (client, state) => {
    validateResultPayload(result);

    return client.logShowMoreFoldedResults(
      partialDocumentInformation(result, state),
      documentIdentifier(result),
      getCaseContextAnalyticsMetadata(state.insightCaseContext)
    );
  });

export const logShowLessFoldedResults = (): InsightAction =>
  makeInsightAnalyticsAction('analytics/folding/showLess', (client, state) =>
    client.logShowLessFoldedResults(
      getCaseContextAnalyticsMetadata(state.insightCaseContext)
    )
  );

export const insightFoldedResultAnalyticsClient = {
  logShowMoreFoldedResults,
  logShowLessFoldedResults,
};
