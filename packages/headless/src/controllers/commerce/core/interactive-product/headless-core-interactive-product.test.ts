import {configuration} from '../../../../app/common-reducers.js';
import {productClick} from '../../../../features/commerce/product/product-actions.js';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state.js';
import {
  buildMockCommerceEngine,
  MockedCommerceEngine,
} from '../../../../test/mock-engine-v2.js';
import {buildMockProduct} from '../../../../test/mock-product.js';
import {
  buildCoreInteractiveProduct,
  InteractiveProduct,
} from './headless-core-interactive-product.js';

vi.mock('../../../../features/commerce/product/product-actions');

describe('core interactive result', () => {
  let engine: MockedCommerceEngine;

  const product = buildMockProduct({
    ec_name: 'product 1',
    ec_price: 17.99,
    ec_promo_price: 15.99,
    ec_product_id: 'product1-id',
    permanentid: 'product-1-permanentid',
    position: 1,
  });

  function initializeInteractiveResult() {
    buildCoreInteractiveProduct(engine, {
      options: {
        product,
      },
      responseIdSelector: () => 'responseId',
    });
  }

  beforeEach(() => {
    engine = buildMockCommerceEngine(buildMockCommerceState());
    initializeInteractiveResult();
  });

  it('adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({configuration});
  });

  describe('#select', () => {
    it('when ec_name, ec_product_id, and ec_promo_price or ec_price are defined on the product, dispatches productClick with the correct payload', () => {
      const controller = buildCoreInteractiveProduct(engine, {
        options: {
          product,
        },
        responseIdSelector: () => 'responseId',
      });

      controller.select();

      expect(productClick).toHaveBeenCalledWith({
        product: {
          name: product.ec_name,
          price: product.ec_promo_price,
          productId: product.ec_product_id,
        },
        position: product.position,
        responseId: 'responseId',
      });
    });

    it('when ec_name is null on the product, falls back to the permanentid field to set the product name', () => {
      const controller = buildCoreInteractiveProduct(engine, {
        options: {
          product: {
            ...product,
            ec_name: null,
          },
        },
        responseIdSelector: () => 'responseId',
      });

      controller.select();

      expect(productClick).toHaveBeenCalledWith({
        product: {
          name: product.permanentid,
          price: product.ec_promo_price,
          productId: product.ec_product_id,
        },
        position: product.position,
        responseId: 'responseId',
      });
    });

    it('when ec_product_id is null on the product, falls back to the permanentid field to set the product id', () => {
      const controller = buildCoreInteractiveProduct(engine, {
        options: {
          product: {
            ...product,
            ec_product_id: null,
          },
        },
        responseIdSelector: () => 'responseId',
      });

      controller.select();

      expect(productClick).toHaveBeenCalledWith({
        product: {
          name: product.ec_name,
          price: product.ec_promo_price,
          productId: product.permanentid,
        },
        position: product.position,
        responseId: 'responseId',
      });
    });

    it('when ec_promo_price and ec_price are null on the product, falls back to NaN to set the product price', () => {
      const controller = buildCoreInteractiveProduct(engine, {
        options: {
          product: {
            ...product,
            ec_promo_price: null,
            ec_price: null,
          },
        },
        responseIdSelector: () => 'responseId',
      });

      controller.select();

      expect(productClick).toHaveBeenCalledWith({
        product: {
          name: product.ec_name,
          price: NaN,
          productId: product.ec_product_id,
        },
        position: product.position,
        responseId: 'responseId',
      });
    });
  });

  it('when ec_name, ec_product_id, and ec_promo_price or ec_price are defined on the product, warningMessage is undefined', () => {
    const controller = buildCoreInteractiveProduct(engine, {
      options: {
        product,
      },
      responseIdSelector: () => 'responseId',
    });

    expect((controller as InteractiveProduct).warningMessage).toBeUndefined();
  });

  it('when ec_name is null on the product, warningMessage is defined', () => {
    const controller = buildCoreInteractiveProduct(engine, {
      options: {
        product: {
          ...product,
          ec_name: null,
        },
      },
      responseIdSelector: () => 'responseId',
    });

    expect((controller as InteractiveProduct).warningMessage).toBeDefined();
  });

  it('when ec_product_id is null on the product, warningMessage is defined', () => {
    const controller = buildCoreInteractiveProduct(engine, {
      options: {
        product: {
          ...product,
          ec_product_id: null,
        },
      },
      responseIdSelector: () => 'responseId',
    });

    expect((controller as InteractiveProduct).warningMessage).toBeDefined();
  });

  it('when ec_promo_price and ec_price are null on the product, warningMessage is defined', () => {
    const controller = buildCoreInteractiveProduct(engine, {
      options: {
        product: {
          ...product,
          ec_promo_price: null,
          ec_price: null,
        },
      },
      responseIdSelector: () => 'responseId',
    });

    expect((controller as InteractiveProduct).warningMessage).toBeDefined();
  });
});
