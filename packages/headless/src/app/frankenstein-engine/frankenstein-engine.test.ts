import {engineMarkerKey} from '../engine-marker.js';
import {
  buildFrankensteinEngine,
  type FrankensteinEngine,
  type FrankensteinEngineOptions,
} from './frankenstein-engine.js';
import {
  commerceEngineKey,
  getCommerceEngine,
  getSearchEngine,
  searchEngineKey,
} from './frankenstein-engine-utils.js';

function buildSampleFrankensteinEngine(): FrankensteinEngine {
  const options: FrankensteinEngineOptions = {
    configuration: {
      organizationId: 'searchuisamples',
      accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
      analytics: {
        enabled: false,
      },
      commerce: {
        trackingId: 'sports-ui-samples',
        context: {
          language: 'en',
          country: 'US',
          currency: 'USD',
          view: {
            url: 'https://sports.barca.group',
          },
        },
      },
    },
  };
  return buildFrankensteinEngine(options);
}

describe('FrankensteinEngine', () => {
  describe('buildFrankensteinEngine', () => {
    it('builds successfully with valid configuration', () => {
      expect(() => buildSampleFrankensteinEngine()).not.toThrow();
    });

    it('throws when configuration is invalid (missing organizationId)', () => {
      const options: FrankensteinEngineOptions = {
        configuration: {
          organizationId: '',
          accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
          analytics: {enabled: false},
          commerce: {
            trackingId: 'sports-ui-samples',
            context: {
              language: 'en',
              country: 'US',
              currency: 'USD',
              view: {url: 'https://sports.barca.group'},
            },
          },
        },
      };
      expect(() => buildFrankensteinEngine(options)).toThrow();
    });

    it('throws when commerce configuration is missing', () => {
      expect(() =>
        buildFrankensteinEngine({
          configuration: {
            organizationId: 'searchuisamples',
            accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
            // biome-ignore lint/suspicious/noExplicitAny: intentionally invalid for test
            commerce: undefined as any,
          },
        })
      ).toThrow();
    });
  });

  describe('engine marker', () => {
    it('has "frankenstein" as engine marker', () => {
      const engine = buildSampleFrankensteinEngine();
      expect(engine[engineMarkerKey]).toBe('frankenstein');
    });

    it('engineMarkerKey is not enumerable on the engine', () => {
      const engine = buildSampleFrankensteinEngine();
      const ownKeys = Reflect.ownKeys(engine);
      expect(ownKeys).not.toContain(engineMarkerKey);
    });
  });

  describe('sub-engines', () => {
    it('has a search sub-engine accessible via searchEngineKey', () => {
      const engine = buildSampleFrankensteinEngine();
      expect(engine[searchEngineKey]).toBeDefined();
    });

    it('has a commerce sub-engine accessible via commerceEngineKey', () => {
      const engine = buildSampleFrankensteinEngine();
      expect(engine[commerceEngineKey]).toBeDefined();
    });

    it('searchEngineKey is not enumerable on the engine', () => {
      const engine = buildSampleFrankensteinEngine();
      const ownKeys = Reflect.ownKeys(engine);
      expect(ownKeys).not.toContain(searchEngineKey);
    });

    it('commerceEngineKey is not enumerable on the engine', () => {
      const engine = buildSampleFrankensteinEngine();
      const ownKeys = Reflect.ownKeys(engine);
      expect(ownKeys).not.toContain(commerceEngineKey);
    });

    it('getSearchEngine retrieves the search sub-engine', () => {
      const engine = buildSampleFrankensteinEngine();
      const searchEngine = getSearchEngine(engine);
      expect(searchEngine).toBeDefined();
      expect(searchEngine[engineMarkerKey]).toBe('search');
    });

    it('getCommerceEngine retrieves the commerce sub-engine', () => {
      const engine = buildSampleFrankensteinEngine();
      const commerceEngine = getCommerceEngine(engine);
      expect(commerceEngine).toBeDefined();
      expect(commerceEngine[engineMarkerKey]).toBe('commerce');
    });

    it('does not expose dispatch or subscribe at the Frankenstein engine level', () => {
      const engine = buildSampleFrankensteinEngine();
      expect('dispatch' in engine).toBe(false);
      expect('subscribe' in engine).toBe(false);
      expect('addReducers' in engine).toBe(false);
    });
  });

  describe('analytics', () => {
    it('can disable analytics', () => {
      const engine = buildSampleFrankensteinEngine();
      expect(() => engine.disableAnalytics()).not.toThrow();
    });

    it('can enable analytics', () => {
      const engine = buildSampleFrankensteinEngine();
      engine.disableAnalytics();
      expect(() => engine.enableAnalytics()).not.toThrow();
    });
  });

  describe('logger', () => {
    it('exposes a logger', () => {
      const engine = buildSampleFrankensteinEngine();
      expect(engine.logger).toBeDefined();
    });
  });

  describe('navigatorContext', () => {
    it('exposes a navigator context', () => {
      const engine = buildSampleFrankensteinEngine();
      expect(engine.navigatorContext).toBeDefined();
    });
  });

  describe('configuration', () => {
    it('exposes a configuration object', () => {
      const engine = buildSampleFrankensteinEngine();
      expect(engine.configuration).toBeDefined();
      expect(engine.configuration.organizationId).toBe('searchuisamples');
    });
  });
});

describe('frankenstein-engine-utils', () => {
  describe('searchEngineKey', () => {
    it('is a well-known Symbol', () => {
      expect(searchEngineKey).toBe(
        Symbol.for('coveo-frankenstein-search-engine')
      );
    });
  });

  describe('commerceEngineKey', () => {
    it('is a well-known Symbol', () => {
      expect(commerceEngineKey).toBe(
        Symbol.for('coveo-frankenstein-commerce-engine')
      );
    });
  });
});
