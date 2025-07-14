import {setSearchHub} from '../../features/search-hub/search-hub-actions.js';
import {
  buildRecommendationEngine,
  type RecommendationEngine,
  type RecommendationEngineOptions,
} from './recommendation-engine.js';
import {getSampleRecommendationEngineConfiguration} from './recommendation-engine-configuration.js';

describe('buildRecommendationEngine', () => {
  let options: RecommendationEngineOptions;
  let engine: RecommendationEngine;

  function initEngine() {
    engine = buildRecommendationEngine(options);
  }

  beforeEach(() => {
    options = {
      configuration: getSampleRecommendationEngineConfiguration(),
      loggerOptions: {level: 'silent'},
    };

    initEngine();
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
      options.configuration.analytics = {
        proxyBaseUrl: 'foo',
      };
      expect(() => initEngine()).toThrow();
    });

    it('passing a URL proxyBaseUrl does not throw', () => {
      options.configuration.analytics = {
        proxyBaseUrl: 'https://example.com/analytics',
      };
      expect(() => initEngine()).not.toThrow();
    });

    it('passing a trackingId containing 100 valid characters or less does not throw', () => {
      options.configuration.analytics = {
        trackingId:
          'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-.abcdefghijklmnopqrstuvwxyzABCDEFGHI',
      };
      expect(initEngine).not.toThrow();
    });

    it('passing a trackingId containing 101 valid characters or more throws', () => {
      options.configuration.analytics = {
        trackingId:
          'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-.abcdefghijklmnopqrstuvwxyzABCDEFGHIJ',
      };
      expect(initEngine).toThrow();
    });

    it('passing trackingId containing an invalid character throws', () => {
      options.configuration.analytics = {
        trackingId:
          'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-.\\',
      };
      expect(initEngine).toThrow();
    });
  });

  it('passing an invalid searchHub throws', () => {
    options.configuration.searchHub = '';
    expect(initEngine).toThrow();
  });

  it('passing an empty pipeline does not throw', () => {
    options.configuration.pipeline = '';
    expect(initEngine).not.toThrow();
  });

  it('#engine.state retrieves the updated state', () => {
    const initialSearchHub = engine.state.searchHub;
    engine.dispatch(setSearchHub('newHub'));
    expect(engine.state.searchHub).not.toBe(initialSearchHub);
  });

  it("it's possible to configure the pipeline", () => {
    const pipeline = 'newPipe';
    options.configuration.pipeline = pipeline;
    initEngine();

    expect(engine.state.pipeline).toBe(pipeline);
  });

  it("it's possible to configure the searchHub", () => {
    const searchHub = 'newHub';
    options.configuration.searchHub = searchHub;
    initEngine();

    expect(engine.state.searchHub).toBe(searchHub);
  });

  it("it's possible to configure the timezone", () => {
    const timezone = 'Africa/Johannesburg';
    options.configuration.timezone = timezone;
    initEngine();

    expect(engine.state.configuration.search.timezone).toBe(timezone);
  });

  it("it's possible to configure the locale", () => {
    const locale = 'fr-CA';
    options.configuration.locale = locale;
    initEngine();

    expect(engine.state.configuration.search.locale).toBe(locale);
  });

  it('should ensure that engine.relay is the same reference as thunk extra args relay', async () => {
    const thunkRelay = await engine.dispatch(
      (_dispatch, _getState, extra) => extra.relay
    );

    expect(thunkRelay).toBe(engine.relay);
  });
});
