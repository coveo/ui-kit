import {Result} from '../../api/search/search/result';
import {
  ClickAction,
  documentIdentifier,
  makeAnalyticsAction,
  partialDocumentInformation,
  validateResultPayload,
} from '../analytics/analytics-utils';

export const logDocumentQuickview = (result: Result): ClickAction => {
  return makeAnalyticsAction(
    'analytics/resultPreview/open',
    (client, state) => {
      validateResultPayload(result);
      const info = partialDocumentInformation(result, state);
      const id = documentIdentifier(result);
      return client.makeDocumentQuickview(info, id);
    }
  );
};
