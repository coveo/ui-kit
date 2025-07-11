import type {ItemClick} from '@coveo/relay-event-types';
import type {Result} from '../../api/search/search/result.js';
import {
  type ClickAction,
  documentIdentifier,
  makeAnalyticsAction,
  partialDocumentInformation,
  validateResultPayload,
} from '../analytics/analytics-utils.js';

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
    analyticsType: 'itemClick',
    analyticsPayloadBuilder: (state): ItemClick => {
      const docInfo = partialDocumentInformation(result, state);
      const docId = documentIdentifier(result);
      return {
        responseId: result.searchUid ?? '',
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
