import {Result} from '../../api/search/search/result';
import {
  AnalyticsType,
  documentIdentifier,
  InsightAction,
  makeInsightAnalyticsAction,
  partialDocumentInformation,
  validateResultPayload,
} from '../analytics/analytics-utils';
import {getCaseContextAnalyticsMetadata} from '../case-context/case-context-state';

export const logShowMoreFoldedResults = (
  result: Result
): InsightAction<AnalyticsType.Click> =>
  makeInsightAnalyticsAction(
    'analytics/folding/showMore',
    AnalyticsType.Click,
    (client, state) => {
      validateResultPayload(result);

      return client.logShowMoreFoldedResults(
        partialDocumentInformation(result, state),
        documentIdentifier(result),
        getCaseContextAnalyticsMetadata(state.insightCaseContext)
      );
    }
  );

export const logShowLessFoldedResults =
  (): InsightAction<AnalyticsType.Custom> =>
    makeInsightAnalyticsAction(
      'analytics/folding/showLess',
      AnalyticsType.Custom,
      (client, state) =>
        client.logShowLessFoldedResults(
          getCaseContextAnalyticsMetadata(state.insightCaseContext)
        )
    );

export const insightFoldedResultAnalyticsClient = {
  logShowMoreFoldedResults,
  logShowLessFoldedResults,
};
