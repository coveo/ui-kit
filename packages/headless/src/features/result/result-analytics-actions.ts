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
    analyticsType: 'ecProductView',
    analyticsPayloadBuilder: (_state) => {
      return {
        currency: 'USD',
        product: {
          name: 'Fail-safe Brown Flip Flop',
          price: 24,
          productId: 'SP04049_00005',
        },
      };
    },
  });
