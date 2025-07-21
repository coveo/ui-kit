import {createCartKey} from '../../controllers/commerce/context/cart/headless-cart.js';
import {stateKey} from '../state-key.js';
import {
  buildCommerceEngine,
  type CommerceEngine,
  type CommerceEngineOptions,
} from './commerce-engine.js';
import {getSampleCommerceEngineConfiguration} from './commerce-engine-configuration.js';

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

  describe('validating the basic configuration', () => {
    it('passing an empty organizationId throws', () => {
      options.configuration.organizationId = '';
      expect(() => initEngine()).toThrow();
    });

    it('passing an empty accessToken throws', () => {
      options.configuration.accessToken = '';
      expect(initEngine).toThrow();
    });

    it('passing an empty name throws', () => {
      options.configuration.name = '';
      expect(initEngine).toThrow();
    });
  });

  describe('validating the analytics configuration', () => {
    it('passing a non-URL proxyBaseUrl throws', () => {
      options.configuration.analytics.proxyBaseUrl = 'foo';

      expect(() => initEngine()).toThrow();
    });

    it('passing a URL proxyBaseUrl does not throw', () => {
      options.configuration.analytics.proxyBaseUrl =
        'https://example.com/analytics';

      expect(() => initEngine()).not.toThrow();
    });

    it('passing a trackingId containing 100 valid characters or less does not throw', () => {
      options.configuration.analytics.trackingId =
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-.abcdefghijklmnopqrstuvwxyzABCDEFGHI';

      expect(initEngine).not.toThrow();
    });

    it('passing a trackingId containing 101 valid characters or more throws', () => {
      options.configuration.analytics.trackingId =
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-.abcdefghijklmnopqrstuvwxyzABCDEFGHIJ';
      expect(initEngine).toThrow();
    });

    it('passing trackingId containing an invalid character throws', () => {
      options.configuration.analytics.trackingId =
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-.\\';

      expect(initEngine).toThrow();
    });
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

  it('should ensure that engine.relay is the same reference as thunk extra args relay', async () => {
    const thunkRelay = await engine.dispatch(
      (_dispatch, _getState, extra) => extra.relay
    );

    expect(thunkRelay).toBe(engine.relay);
  });
});
