import {Result} from '../../api/search/search/result';
import {
  AnalyticsType,
  documentIdentifier,
  makeAnalyticsAction,
  partialDocumentInformation,
  validateResultPayload,
} from '../analytics/analytics-utils';

export const logDocumentQuickview = (result: Result) => {
  return buildDocumentQuickviewThunk(result)();
};

export const buildDocumentQuickviewThunk = (result: Result) => {
  return makeAnalyticsAction(
    'analytics/resultPreview/open',
    AnalyticsType.Click,
    (client, state) => {
      validateResultPayload(result);
      const info = partialDocumentInformation(result, state);
      const id = documentIdentifier(result);
      return client.logDocumentQuickview(info, id);
    }
  );
};
