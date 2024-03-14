import {Product} from '@coveo/relay-event-types';
import {
  CommerceContextState,
  getContextInitialState,
} from '../../../features/commerce/context/context-state';
import {buildMockCommerceState} from '../../../test/mock-commerce-state';
import {
  buildMockCommerceEngine,
  MockedCommerceEngine,
} from '../../../test/mock-engine-v2';
import {buildProductView, ProductView} from './headless-product-view';

describe('ProductView', () => {
  let engine: MockedCommerceEngine;
  let productView: ProductView;
  let commerceContext: CommerceContextState;

  function initializeProductView() {
    productView = buildProductView(engine);
  }

  beforeEach(() => {
    commerceContext = getContextInitialState();
    engine = buildMockCommerceEngine(buildMockCommerceState({commerceContext}));
    initializeProductView();
  });

  describe('#view', () => {
    it('dispatches ec.productClick', () => {
      commerceContext.currency = 'USD';

      const product: Product = {
        name: 'ski',
        price: 1,
        productId: 'a',
      };

      productView.view(product);
      expect(engine.relay.emit).toHaveBeenCalledWith('ec.productView', {
        currency: 'USD',
        product,
      });
    });
  });
});
