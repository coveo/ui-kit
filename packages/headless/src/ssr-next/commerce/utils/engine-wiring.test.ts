import type {CurrencyCodeISO4217} from '@coveo/relay-event-types';
import {
  type CommerceEngineConfiguration,
  getSampleCommerceEngineConfiguration,
} from '../../../app/commerce-engine/commerce-engine-configuration.js';
import {extendEngineConfiguration} from './engine-wiring.js';

describe('#assembleEngineConfiguration', () => {
  let engineOptions: CommerceEngineConfiguration;
  const sampleCommerceConfig = getSampleCommerceEngineConfiguration();

  beforeEach(() => {
    engineOptions = extendEngineConfiguration(sampleCommerceConfig, {
      country: 'some-country',
      currency: 'some-currency' as CurrencyCodeISO4217,
      language: 'some-language',
      url: 'https://example.com',
      cart: {
        items: [{name: 'foo', price: 10, productId: 'foo_id', quantity: 1}],
      },
      location: {latitude: 37.7749, longitude: -122.4194},
    });
  });

  it('should set the context fields from commonBuildOptions', () => {
    expect(engineOptions.context).toEqual({
      view: {url: 'https://example.com'},
      language: 'some-language',
      country: 'some-country',
      location: {latitude: 37.7749, longitude: -122.4194},
      currency: 'some-currency',
    });
  });

  it('should set the cart field from commonBuildOptions', () => {
    expect(engineOptions.cart).toEqual({
      items: [
        {
          name: 'foo',
          price: 10,
          productId: 'foo_id',
          quantity: 1,
        },
      ],
    });
  });

  it('should not modify the rest of the engine configuration', () => {
    const {
      cart: _cart,
      context: _context,
      ...defaultConfig
    } = JSON.parse(JSON.stringify(sampleCommerceConfig));
    const {
      cart: __cart,
      context: __context,
      ...assembledConfig
    } = engineOptions;

    expect(assembledConfig).toEqual(defaultConfig);
  });
});
