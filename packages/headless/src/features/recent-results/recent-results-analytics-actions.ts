import {Result} from '../../api/search/search/result';
import {
  AnalyticsType,
  partialDocumentInformation,
  documentIdentifier,
  validateResultPayload,
  CustomAction,
} from '../analytics/analytics-utils';
import {makeAnalyticsAction} from '../analytics/search-analytics-utils';

export const logRecentResultClick = (result: Result): CustomAction =>
  makeAnalyticsAction(
    'analytics/recentResults/click',
    AnalyticsType.Custom,
    (client, state) => {
      validateResultPayload(result);
      return client.makeRecentResultClick(
        partialDocumentInformation(result, state),
        documentIdentifier(result)
      );
    }
  );

export const logClearRecentResults = (): CustomAction =>
  makeAnalyticsAction(
    'analytics/recentResults/clear',
    AnalyticsType.Custom,
    (client) => client.makeClearRecentResults()
  );
