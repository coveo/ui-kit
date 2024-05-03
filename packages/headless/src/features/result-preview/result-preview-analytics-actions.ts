import {ItemClick} from '@coveo/relay-event-types';
import {Result} from '../../api/search/search/result';
import {
  ClickAction,
  documentIdentifier,
  makeAnalyticsAction,
  partialDocumentInformation,
  validateResultPayload,
} from '../analytics/analytics-utils';

export const logDocumentQuickview = (result: Result): ClickAction => {
  return makeAnalyticsAction({
    prefix: 'analytics/resultPreview/open',
    __legacy__getBuilder: (client, state) => {
      validateResultPayload(result);
      const info = partialDocumentInformation(result, state);
      const id = documentIdentifier(result);
      return client.makeDocumentQuickview(info, id);
    },
    analyticsType: 'itemClick',
    analyticsPayloadBuilder: (state): ItemClick => {
      const docInfo = partialDocumentInformation(result, state);
      const docId = documentIdentifier(result);
      return {
        searchUid: state.search?.response.searchUid ?? '',
        position: docInfo.documentPosition,
        actionCause: 'preview',
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
