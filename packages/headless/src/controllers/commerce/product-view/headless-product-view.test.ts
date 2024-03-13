import {Ec} from '@coveo/relay-event-types';
import {buildMockCommerceState} from '../../../test/mock-commerce-state';
import {
  buildMockCommerceEngine,
  MockedCommerceEngine,
} from '../../../test/mock-engine-v2';
import {buildProductView, ProductView} from './headless-product-view';

describe('ProductView', () => {
  let engine: MockedCommerceEngine;
  let productView: ProductView;

  function initializeProductView() {
    productView = buildProductView(engine);
  }

  beforeEach(() => {
    engine = buildMockCommerceEngine(buildMockCommerceState());
    initializeProductView();
  });

  describe('#view', () => {
    it('dispatches ec.productClick', () => {
      const payload: Ec.ProductView = {
        currency: 'USD',
        product: {
          name: 'ski',
          price: 1,
          productId: 'a',
        },
      };

      productView.view(payload);
      expect(engine.relay.emit).toHaveBeenCalledWith('ec.productView', payload);
    });
  });
});
