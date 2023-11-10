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
    analyticsType: 'ecProductClick',
    analyticsPayloadBuilder: () => {
      return {
        currency: 'USD',
        position: 1,
        responseId: '1111',
        product: {
          name: 'SupPlane Paddleboard',
          price: 520,
          productId: 'SP00062_00006',
        },
      };
    },
  });
