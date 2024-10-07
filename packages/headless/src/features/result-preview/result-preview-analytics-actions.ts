import {ItemClick} from '@coveo/relay-event-types';
import {SearchAnalyticsProvider} from '../../api/analytics/search-analytics.js';
import {Result} from '../../api/search/search/result.js';
import {
  ClickAction,
  documentIdentifier,
  makeAnalyticsAction,
  partialDocumentInformation,
  validateResultPayload,
} from '../analytics/analytics-utils.js';

export const logDocumentQuickview = (result: Result): ClickAction => {
  return makeAnalyticsAction({
    prefix: 'analytics/resultPreview/open',
    __legacy__getBuilder: (client, state) => {
      validateResultPayload(result);
      const info = partialDocumentInformation(result, state);
      const id = documentIdentifier(result);
      return client.makeDocumentQuickview(info, id);
    },
    __legacy__provider: (getState) => {
      const customAnalyticsProvider = new SearchAnalyticsProvider(getState);
      customAnalyticsProvider.getSearchUID = () => result.searchUid ?? '';
      return customAnalyticsProvider;
    },
    analyticsType: 'itemClick',
    analyticsPayloadBuilder: (state): ItemClick => {
      const docInfo = partialDocumentInformation(result, state);
      const docId = documentIdentifier(result);
      return {
        searchUid: result.searchUid ?? '',
        position: docInfo.documentPosition,
        itemMetadata: {
          uniqueFieldName: docId.contentIDKey,
          uniqueFieldValue: docId.contentIDValue,
          title: docInfo.documentTitle,
          author: docInfo.documentAuthor,
          url: docInfo.documentUrl,
        },
      };
    },
  });
};
