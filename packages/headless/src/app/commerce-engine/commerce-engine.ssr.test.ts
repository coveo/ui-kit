import {defineCart} from '../../controllers/commerce/context/cart/headless-cart.ssr.js';
import {defineParameterManager} from '../../controllers/commerce/core/parameter-manager/headless-core-parameter-manager.ssr.js';
import {defineSummary} from '../../controllers/commerce/core/summary/headless-core-summary.ssr.js';
import {defineRecommendations} from '../../controllers/commerce/recommendations/headless-recommendations.ssr.js';
import {defineDidYouMean} from '../../controllers/commerce/search/did-you-mean/headless-did-you-mean.ssr.js';
import {getSampleCommerceEngineConfiguration} from './commerce-engine-configuration.js';
import {defineCommerceEngine} from './commerce-engine.ssr.js';

describe('Commerce Engine SSR', () => {
  const {
    listingEngineDefinition,
    recommendationEngineDefinition,
    searchEngineDefinition,
    standaloneEngineDefinition,
  } = defineCommerceEngine({
    configuration: {
      ...getSampleCommerceEngineConfiguration(),
    },
    controllers: {
      summary: defineSummary(),
      didYouMean: defineDidYouMean(),
      paramManager: defineParameterManager({listing: false}),
      cart: defineCart(),
      popularViewed: defineRecommendations({
        options: {
          slotId: 'd73afbd2-8521-4ee6-a9b8-31f064721e73',
        },
      }),
    },
  });

  it('should only require cart options for standaloneEngineDefinition', () => {
    expect(() =>
      standaloneEngineDefinition.fetchStaticState({
        controllers: {
          cart: {initialState: {items: []}},
        },
      })
    ).not.toThrow();
  });

  it('should only require cart options for listingEngineDefinition', () => {
    expect(() =>
      listingEngineDefinition.fetchStaticState({
        controllers: {
          cart: {initialState: {items: []}},
        },
      })
    ).not.toThrow();
  });

  it('should only require cart and paramManager options for searchEngineDefinition', () => {
    expect(() =>
      searchEngineDefinition.fetchStaticState({
        controllers: {
          cart: {initialState: {items: []}},
          paramManager: {initialState: {parameters: {}}},
        },
      })
    ).not.toThrow();
  });

  it('should only require cart options for recommendationEngineDefinition', () => {
    expect(() =>
      recommendationEngineDefinition.fetchStaticState({
        controllers: {
          cart: {initialState: {items: []}},
        },
      })
    ).not.toThrow();
  });

  it('should allow optional recommendation controller options for recommendationEngineDefinition', () => {
    expect(() =>
      recommendationEngineDefinition.fetchStaticState({
        controllers: {
          cart: {initialState: {items: []}},
          popularViewed: {enabled: true, productId: 'some-product-id'},
        },
      })
    ).not.toThrow();
  });
});
