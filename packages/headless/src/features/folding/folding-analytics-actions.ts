import {Result} from '../../api/search/search/result.js';
import {
  ClickAction,
  CustomAction,
  makeAnalyticsAction,
} from '../analytics/analytics-utils.js';
import {
  AnalyticsType,
  documentIdentifier,
  partialDocumentInformation,
  validateResultPayload,
} from '../analytics/analytics-utils.js';

export const logShowMoreFoldedResults = (result: Result): ClickAction =>
  makeAnalyticsAction(
    'analytics/folding/showMore',
    AnalyticsType.Click,
    (client, state) => {
      validateResultPayload(result);

      return client.makeShowMoreFoldedResults(
        partialDocumentInformation(result, state),
        documentIdentifier(result)
      );
    }
  );

export const logShowLessFoldedResults = (): CustomAction =>
  makeAnalyticsAction(
    'analytics/folding/showLess',
    AnalyticsType.Custom,
    (client) => {
      return client.makeShowLessFoldedResults();
    }
  );

export const foldedResultAnalyticsClient = {
  logShowMoreFoldedResults,
  logShowLessFoldedResults,
};
