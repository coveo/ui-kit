import type {Result} from '../../api/search/search/result.js';
import {
  type ClickAction,
  type CustomAction,
  documentIdentifier,
  makeAnalyticsAction,
  partialDocumentInformation,
  validateResultPayload,
} from '../analytics/analytics-utils.js';

export const logShowMoreFoldedResults = (result: Result): ClickAction =>
  makeAnalyticsAction('analytics/folding/showMore', (client, state) => {
    validateResultPayload(result);

    return client.makeShowMoreFoldedResults(
      partialDocumentInformation(result, state),
      documentIdentifier(result)
    );
  });

const logShowLessFoldedResults = (): CustomAction =>
  makeAnalyticsAction('analytics/folding/showLess', (client) => {
    return client.makeShowLessFoldedResults();
  });

export const foldedResultAnalyticsClient = {
  logShowMoreFoldedResults,
  logShowLessFoldedResults,
};
