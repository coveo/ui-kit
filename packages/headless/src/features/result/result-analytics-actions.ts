import {ItemClick} from '@coveo/relay-event-types';
import {SearchAnalyticsProvider} from '../../api/analytics/search-analytics';
import {Result} from '../../api/search/search/result';
import {
  partialDocumentInformation,
  documentIdentifier,
  validateResultPayload,
  makeAnalyticsAction,
  ClickAction,
} from '../analytics/analytics-utils';

export const logDocumentOpen = (result: Result): ClickAction =>
  makeAnalyticsAction({
    prefix: 'analytics/result/open',
    __legacy__getBuilder: (client, state) => {
      validateResultPayload(result);
      return client.makeDocumentOpen(
        partialDocumentInformation(result, state),
        documentIdentifier(result)
      );
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
        searchUid: state.search?.response.searchUid ?? '',
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
