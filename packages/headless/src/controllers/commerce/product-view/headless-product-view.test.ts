import {ProductRecommendation} from '../../../api/search/search/product-recommendation';
import {buildMockCommerceState} from '../../../test/mock-commerce-state';
import {
  buildMockCommerceEngine,
  MockedCommerceEngine,
} from '../../../test/mock-engine-v2';
import {buildProductView, ProductView} from './headless-product-view';


describe('Productview', () => {
  let engine: MockedCommerceEngine;
  // TODO: What goes here?
  let product: ProductRecommendation;
  let productView: ProductView;

  function initializeProductView() {
    // TODO: What goes here?
    product = {};

    productView = buildProductView(engine);
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
