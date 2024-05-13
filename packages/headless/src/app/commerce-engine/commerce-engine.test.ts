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
        sku: 'product-id-1',
        quantity: 2,
        name: 'product-name-1',
        price: 100,
      },
      {
        productId: 'product-id',
        sku: 'product-id-2',
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
      items.map((item) => item.sku)
    );

    expect(engine[stateKey].cart.cart).toEqual({
      [items[0].sku]: items[0],
      [items[1].sku]: items[1],
    });
  });
});
