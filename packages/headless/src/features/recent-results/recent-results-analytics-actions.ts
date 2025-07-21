import type {Result} from '../../api/search/search/result.js';
import {
  type CustomAction,
  documentIdentifier,
  makeAnalyticsAction,
  partialDocumentInformation,
  validateResultPayload,
} from '../analytics/analytics-utils.js';

export const logRecentResultClick = (result: Result): CustomAction =>
  makeAnalyticsAction('analytics/recentResults/click', (client, state) => {
    validateResultPayload(result);
    return client.makeRecentResultClick(
      partialDocumentInformation(result, state),
      documentIdentifier(result)
    );
  });

export const logClearRecentResults = (): CustomAction =>
  makeAnalyticsAction('analytics/recentResults/clear', (client) =>
    client.makeClearRecentResults()
  );
