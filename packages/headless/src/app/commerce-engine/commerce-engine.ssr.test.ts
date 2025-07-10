import {defineCart} from '../../controllers/commerce/context/cart/headless-cart.ssr.js';
import {defineParameterManager} from '../../controllers/commerce/core/parameter-manager/headless-core-parameter-manager.ssr.js';
import {defineSummary} from '../../controllers/commerce/core/summary/headless-core-summary.ssr.js';
import {defineRecommendations} from '../../controllers/commerce/recommendations/headless-recommendations.ssr.js';
import {defineDidYouMean} from '../../controllers/commerce/search/did-you-mean/headless-did-you-mean.ssr.js';
import type {CommerceEngineDefinitionOptions} from '../commerce-ssr-engine/factories/build-factory.js';
import {defineCommerceEngine} from './commerce-engine.ssr.js';
import {getSampleCommerceEngineConfiguration} from './commerce-engine-configuration.js';

describe('Commerce Engine SSR', () => {
  let definitionOptions: NonNullable<CommerceEngineDefinitionOptions>;

  let engineDefinition: ReturnType<
    typeof defineCommerceEngine<
      NonNullable<typeof definitionOptions.controllers>
    >
  >;

  let listingEngineDefinition: (typeof engineDefinition)['listingEngineDefinition'];
  let recommendationEngineDefinition: (typeof engineDefinition)['recommendationEngineDefinition'];
  let searchEngineDefinition: (typeof engineDefinition)['searchEngineDefinition'];
  let standaloneEngineDefinition: (typeof engineDefinition)['standaloneEngineDefinition'];

  beforeEach(() => {
    definitionOptions = {
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
    };
    engineDefinition = defineCommerceEngine(definitionOptions);

    listingEngineDefinition = engineDefinition.listingEngineDefinition;
    recommendationEngineDefinition =
      engineDefinition.recommendationEngineDefinition;
    searchEngineDefinition = engineDefinition.searchEngineDefinition;
    standaloneEngineDefinition = engineDefinition.standaloneEngineDefinition;
  });

  describe('#standaloneEngineDefinition', () => {
    it('should only require cart options', () => {
      expect(() =>
        standaloneEngineDefinition.fetchStaticState({
          controllers: {
            cart: {initialState: {items: []}},
          },
        })
      ).not.toThrow();
    });

    it('#getAccessToken should return the access token', () => {
      expect(standaloneEngineDefinition.getAccessToken()).toBe(
        getSampleCommerceEngineConfiguration().accessToken
      );
    });

    it('#setAccessToken should update the access token', () => {
      standaloneEngineDefinition.setAccessToken('new-access-token');

      expect(standaloneEngineDefinition.getAccessToken()).toBe(
        'new-access-token'
      );
    });
  });

  describe('#listingEngineDefinition', () => {
    it('should only require cart options', () => {
      expect(() =>
        listingEngineDefinition.fetchStaticState({
          controllers: {
            cart: {initialState: {items: []}},
          },
        })
      ).not.toThrow();
    });

    it('#getAccessToken should return the access token', () => {
      expect(listingEngineDefinition.getAccessToken()).toBe(
        getSampleCommerceEngineConfiguration().accessToken
      );
    });

    it('#setAccessToken should update the access token', () => {
      listingEngineDefinition.setAccessToken('new-access-token');

      expect(listingEngineDefinition.getAccessToken()).toBe('new-access-token');
    });
  });

  describe('#searchEngineDefinition', () => {
    it('should only require cart and paramManager options', () => {
      expect(() =>
        searchEngineDefinition.fetchStaticState({
          controllers: {
            cart: {initialState: {items: []}},
            paramManager: {initialState: {parameters: {}}},
          },
        })
      ).not.toThrow();
    });

    it('#getAccessToken should return the access token', () => {
      expect(searchEngineDefinition.getAccessToken()).toBe(
        getSampleCommerceEngineConfiguration().accessToken
      );
    });

    it('#setAccessToken should update the access token', () => {
      searchEngineDefinition.setAccessToken('new-access-token');

      expect(searchEngineDefinition.getAccessToken()).toBe('new-access-token');
    });
  });

  describe('#recommendationEngineDefinition', () => {
    it('should only require cart options', () => {
      expect(() =>
        recommendationEngineDefinition.fetchStaticState({
          controllers: {
            cart: {initialState: {items: []}},
          },
        })
      ).not.toThrow();
    });

    it('should allow optional recommendation controller options', () => {
      expect(() =>
        recommendationEngineDefinition.fetchStaticState({
          controllers: {
            cart: {initialState: {items: []}},
            popularViewed: {enabled: true, productId: 'some-product-id'},
          },
        })
      ).not.toThrow();
    });

    it('#getAccessToken should return the access token', () => {
      expect(recommendationEngineDefinition.getAccessToken()).toBe(
        getSampleCommerceEngineConfiguration().accessToken
      );
    });

    it('#setAccessToken should update the access token', () => {
      recommendationEngineDefinition.setAccessToken('new-access-token');

      expect(recommendationEngineDefinition.getAccessToken()).toBe(
        'new-access-token'
      );
    });
  });
});
