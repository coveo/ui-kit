import {ProductRecommendation} from '../../../api/search/search/product-recommendation';
import {buildMockCommerceState} from '../../../test/mock-commerce-state';
import {
  buildMockCommerceEngine,
  MockedCommerceEngine,
} from '../../../test/mock-engine-v2';
import {buildProductView, ProductView} from './headless-product-view';

describe('ProductView', () => {
  let engine: MockedCommerceEngine;
  // TODO: What goes here?
  let _product: ProductRecommendation;
  let _productView: ProductView;

  function initializeProductView() {
    // TODO: What goes here?
    _product = {};

    _productView = buildProductView(engine);
  }

  beforeEach(() => {
    engine = buildMockCommerceEngine(buildMockCommerceState());
    initializeProductView();
  });

  describe('#view', () => {
    // eslint-disable-next-line @cspell/spellchecker
    // TODO LENS-1500
    /*it('dispatches ec.productClick', () => {
      interactiveResult.select();
      ...
    });*/
  });
});
