import {getSampleCommerceEngineConfiguration} from '../../../app/commerce-engine/commerce-engine-configuration.js';
import {buildLogger} from '../../../app/logger.js';
import {defineCart} from '../controllers/cart/headless-cart.ssr.js';
import {defineDidYouMean} from '../controllers/did-you-mean/headless-did-you-mean.ssr.js';
import {defineParameterManager} from '../controllers/parameter-manager/headless-core-parameter-manager.ssr.js';
import {defineRecommendations} from '../controllers/recommendations/headless-recommendations.ssr.js';
import {defineSummary} from '../controllers/summary/headless-core-summary.ssr.js';
import type {CommerceEngineDefinitionOptions} from '../factories/build-factory.js';
import {defineCommerceEngine} from './commerce-engine.ssr.js';

vi.mock('../../../app/logger.js', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../../app/logger.js')>();
  return {
    ...original,
    buildLogger: vi.fn((options: Parameters<typeof original.buildLogger>[0]) => {
      const logger = original.buildLogger(options);
      vi.spyOn(logger, 'warn');
      return logger;
    }),
  };
});

describe('Commerce Engine SSR', () => {
  let definitionOptions: NonNullable<CommerceEngineDefinitionOptions>;

  let engineDefinition: ReturnType<
    typeof defineCommerceEngine<NonNullable<typeof definitionOptions.controllers>>
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
      loggerOptions: {level: 'silent'},
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
    recommendationEngineDefinition = engineDefinition.recommendationEngineDefinition;
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

      expect(standaloneEngineDefinition.getAccessToken()).toBe('new-access-token');
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

      expect(recommendationEngineDefinition.getAccessToken()).toBe('new-access-token');
    });
  });

  describe('deprecation warnings', () => {
    const warnings = () =>
      vi
        .mocked(buildLogger)
        .mock.results.flatMap(({value}) =>
          vi.mocked(value.warn).mock.calls.map(([message]: unknown[]) => message)
        );

    const deprecationWarnings = (api: string) =>
      warnings().filter(
        (message) =>
          typeof message === 'string' && message.startsWith(`[Deprecated] ${api} is deprecated`)
      );

    beforeEach(() => {
      vi.mocked(buildLogger).mockClear();
      engineDefinition = defineCommerceEngine(definitionOptions);
      listingEngineDefinition = engineDefinition.listingEngineDefinition;
      searchEngineDefinition = engineDefinition.searchEngineDefinition;
      standaloneEngineDefinition = engineDefinition.standaloneEngineDefinition;
    });

    it('logs a deprecation warning once per definition when #build is called', async () => {
      await listingEngineDefinition.build({controllers: {cart: {initialState: {items: []}}}});
      await searchEngineDefinition.build({controllers: {cart: {initialState: {items: []}}}});

      expect(deprecationWarnings('`build`')).toHaveLength(1);
    });

    it('does not log a deprecation warning for #build when #fetchStaticState is called', async () => {
      await standaloneEngineDefinition.fetchStaticState({
        controllers: {cart: {initialState: {items: []}}},
      });

      expect(deprecationWarnings('`build`')).toHaveLength(0);
      expect(deprecationWarnings('`fetchStaticState.fromBuildResult`')).toHaveLength(0);
    });

    it('does not log a deprecation warning when #hydrateStaticState is called', async () => {
      const allDeprecationWarnings = () =>
        warnings().filter(
          (message) => typeof message === 'string' && message.startsWith('[Deprecated]')
        );
      const staticState = await standaloneEngineDefinition.fetchStaticState({
        controllers: {cart: {initialState: {items: []}}},
      });
      const warningsBeforeHydration = allDeprecationWarnings();

      await standaloneEngineDefinition.hydrateStaticState({
        searchActions: staticState.searchActions,
        controllers: {cart: {initialState: {items: []}}},
      });

      expect(allDeprecationWarnings()).toEqual(warningsBeforeHydration);
    });

    it('logs a deprecation warning when #fetchStaticState.fromBuildResult is called', async () => {
      const buildResult = await standaloneEngineDefinition.build({
        controllers: {cart: {initialState: {items: []}}},
      });
      await standaloneEngineDefinition.fetchStaticState.fromBuildResult({buildResult});

      expect(deprecationWarnings('`fetchStaticState.fromBuildResult`')).toHaveLength(1);
    });

    it('logs a deprecation warning once per definition when #hydrateStaticState.fromBuildResult is called', async () => {
      const staticState = await standaloneEngineDefinition.fetchStaticState({
        controllers: {cart: {initialState: {items: []}}},
      });
      const buildResult = await standaloneEngineDefinition.build({
        controllers: {cart: {initialState: {items: []}}},
      });
      await standaloneEngineDefinition.hydrateStaticState.fromBuildResult({
        buildResult,
        searchActions: staticState.searchActions,
      });
      await standaloneEngineDefinition.hydrateStaticState.fromBuildResult({
        buildResult,
        searchActions: staticState.searchActions,
      });

      expect(deprecationWarnings('`hydrateStaticState.fromBuildResult`')).toHaveLength(1);
    });

    it('logs a deprecation warning when the #extend build option is used', async () => {
      await listingEngineDefinition.build({
        extend: (options) => options,
        controllers: {cart: {initialState: {items: []}}},
      });

      expect(deprecationWarnings('The `extend` build option')).toHaveLength(1);
    });

    it('logs a deprecation warning when #setNavigatorContextProvider is called', () => {
      listingEngineDefinition.setNavigatorContextProvider(() => ({
        clientId: 'client-id',
        location: null,
        referrer: null,
        userAgent: null,
      }));

      expect(deprecationWarnings('`setNavigatorContextProvider`')).toHaveLength(1);
    });

    it('logs a deprecation warning once per definition when the access token methods are called', () => {
      listingEngineDefinition.getAccessToken();
      searchEngineDefinition.getAccessToken();
      listingEngineDefinition.setAccessToken('token');

      expect(deprecationWarnings('`getAccessToken`')).toHaveLength(1);
      expect(deprecationWarnings('`setAccessToken`')).toHaveLength(1);
    });

    it('does not log a deprecation warning for the #defineCart and #defineParameterManager definitions', async () => {
      await searchEngineDefinition.build({controllers: {cart: {initialState: {items: []}}}});

      expect(deprecationWarnings('`defineCart`')).toHaveLength(0);
      expect(deprecationWarnings('`defineParameterManager`')).toHaveLength(0);
    });

    it('logs a deprecation warning once when a definer receives the #listing or #search option', async () => {
      await searchEngineDefinition.build({controllers: {cart: {initialState: {items: []}}}});
      await searchEngineDefinition.build({controllers: {cart: {initialState: {items: []}}}});

      expect(
        deprecationWarnings('Passing `listing` or `search` to `defineParameterManager`')
      ).toHaveLength(1);
      expect(deprecationWarnings('Passing `listing` or `search` to `defineSummary`')).toHaveLength(
        0
      );
    });
  });
});
