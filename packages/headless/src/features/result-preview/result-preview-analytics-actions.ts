import {Result} from '../../api/search/search/result';
import {
  AnalyticsType,
  ClickAction,
  documentIdentifier,
  partialDocumentInformation,
  validateResultPayload,
} from '../analytics/analytics-utils';
import {makeAnalyticsAction} from '../analytics/search-analytics-utils';

export const logDocumentQuickview = (result: Result): ClickAction => {
  return makeAnalyticsAction(
    'analytics/resultPreview/open',
    AnalyticsType.Click,
    (client, state) => {
      validateResultPayload(result);
      const info = partialDocumentInformation(result, state);
      const id = documentIdentifier(result);
      return client.makeDocumentQuickview(info, id);
    }
  );
};
