import {createCartKey} from '../../controllers/commerce/context/cart/headless-cart';
import {stateKey} from '../state-key';
import {
  buildCommerceEngine,
  CommerceEngine,
  CommerceEngineOptions,
} from './commerce-engine';
import {getSampleCommerceEngineConfiguration} from './commerce-engine-configuration';

describe('buildCommerceEngine', () => {
  let options: CommerceEngineOptions;
  let engine: CommerceEngine;

  function initEngine() {
    engine = buildCommerceEngine(options);
  }

  beforeEach(() => {
    options = {
      configuration: getSampleCommerceEngineConfiguration(),
      loggerOptions: {level: 'silent'},
    };

    initEngine();
  });

  it('initializes', () => {
    expect(initEngine).not.toThrow();
    expect(engine[stateKey]).toBeTruthy();
  });

  it('sets the context', () => {
    expect(engine[stateKey].commerceContext).toEqual(
      options.configuration.context
    );
  });

  it('sets the cart if specified in configuration', () => {
    const items = [
      {
        productId: 'product-id',
        quantity: 2,
        name: 'product-name-1',
        price: 100,
      },
      {
        productId: 'product-id',
        quantity: 4,
        name: 'product-name-2',
        price: 25,
      },
    ];
    options.configuration.cart = {
      items,
    };
    initEngine();

    expect(engine[stateKey].cart.cartItems).toEqual(
      items.map((item) => createCartKey(item))
    );

    expect(engine[stateKey].cart.cart).toEqual({
      [createCartKey(items[0])]: items[0],
      [createCartKey(items[1])]: items[1],
    });
  });
});
