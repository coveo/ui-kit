import {Result} from '../../api/search/search/result';
import {
  partialDocumentInformation,
  documentIdentifier,
  validateResultPayload,
  makeAnalyticsAction,
  AnalyticsType,
  ClickAction,
} from '../analytics/analytics-utils';

export const logDocumentOpen = (result: Result): ClickAction =>
  makeAnalyticsAction({
    prefix: 'analytics/result/open',
    __legacy__analyticsType: AnalyticsType.Click,
    __legacy__getBuilder: (client, state) => {
      validateResultPayload(result);
      return client.makeDocumentOpen(
        partialDocumentInformation(result, state),
        documentIdentifier(result)
      );
    },
    analyticsType: 'itemClick',
    analyticsPayloadBuilder: (state) => {
      const docInfo = partialDocumentInformation(result, state);
      const docId = documentIdentifier(result);
      return {
        searchUid: state.search?.response.searchUid,
        position: docInfo.documentPosition,
        itemMetadata: {
          uniqueFieldIdentifier: docId.contentIDKey,
          uniqueFieldValue: docId.contentIDValue,
          title: docInfo.documentTitle,
          author: docInfo.documentAuthor,
          url: docInfo.documentUrl,
        },
      };
    },
  });
