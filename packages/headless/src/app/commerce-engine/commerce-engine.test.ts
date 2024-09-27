import {createCartKey} from '../../controllers/commerce/context/cart/headless-cart.js';
import {stateKey} from '../state-key.js';
import {getSampleCommerceEngineConfiguration} from './commerce-engine-configuration.js';
import {
  buildCommerceEngine,
  CommerceEngine,
  CommerceEngineOptions,
} from './commerce-engine.js';

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

  it('when #proxyBaseUrl is specified in the configuration, sets the #commerce.apiBaseUrl', () => {
    options.configuration.proxyBaseUrl = 'https://example.com/commerce';
    initEngine();

    expect(engine[stateKey].configuration.commerce.apiBaseUrl).toBe(
      options.configuration.proxyBaseUrl
    );
  });

  it('when #proxyBaseUrl is not specified, #commerce.apiBaseUrl is undefined', () => {
    expect(engine[stateKey].configuration.commerce.apiBaseUrl).toBeUndefined();
  });

  it('sets the #commerceContext to the #context specified in the configuration', () => {
    expect(engine[stateKey].commerceContext).toEqual(
      options.configuration.context
    );
  });

  it('when #cart is specified in the configuration, sets the #cart.cartItems accordingly', () => {
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
