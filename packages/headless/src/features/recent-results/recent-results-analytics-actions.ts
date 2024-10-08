import {Result} from '../../api/search/search/result.js';
import {
  makeAnalyticsAction,
  partialDocumentInformation,
  documentIdentifier,
  validateResultPayload,
  CustomAction,
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
