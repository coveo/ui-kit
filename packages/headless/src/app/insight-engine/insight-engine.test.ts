import * as InsightInterfaceActions from '../../features/insight-interface/insight-interface-actions.js';
import {nextAnalyticsUsageWithServiceFeatureWarning} from '../engine.js';
import {getSampleEngineConfiguration} from '../engine-configuration.js';
import {
  buildInsightEngine,
  type InsightEngine,
  type InsightEngineConfiguration,
  type InsightEngineOptions,
} from './insight-engine.js';

const fetchInterfaceSpy = vi.spyOn(InsightInterfaceActions, 'fetchInterface');

function getSampleInsightEngineConfiguration(): InsightEngineConfiguration {
  return {
    ...getSampleEngineConfiguration(),
    insightId: 'sample-insight-id',
  };
}

describe('buildInsightEngine', () => {
  let options: InsightEngineOptions;
  let engine: InsightEngine;

  function initEngine() {
    engine = buildInsightEngine(options);
  }

  beforeEach(() => {
    options = {
      configuration: {
        ...getSampleInsightEngineConfiguration(),
        search: {
          locale: 'en-US',
        },
      },
      loggerOptions: {level: 'silent'},
    };

    initEngine();
  });

  afterEach(() => {
    vi.clearAllMocks();
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

    describe('the analytics mode', () => {
      let warnSpy: ReturnType<typeof vi.spyOn>;

      beforeEach(() => {
        warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      });

      afterEach(() => {
        warnSpy.mockRestore();
      });

      it('should log a warning when the insight engine is used with the next analytics mode', () => {
        options.configuration.analytics = {
          analyticsMode: 'next',
          trackingId: 'example_tracking_id',
        };
        initEngine();

        expect(warnSpy).toHaveBeenCalledTimes(1);
        expect(warnSpy).toHaveBeenCalledWith(
          nextAnalyticsUsageWithServiceFeatureWarning
        );
      });

      it('should not log a warning when the insight engine is used with the legacy analytics mode', () => {
        options.configuration.analytics = {
          analyticsMode: 'legacy',
        };
        initEngine();

        expect(warnSpy).toHaveBeenCalledTimes(0);
      });
    });
  });

  it('passing an invalid insight ID throws', () => {
    options.configuration.insightId = '';
    expect(initEngine).toThrow();
  });

  it('sets the insight ID correctly', () => {
    expect(engine.state.insightConfiguration?.insightId).toEqual(
      options.configuration.insightId
    );
  });

  it('sets the locale correctly', () => {
    expect(engine.state.configuration?.search?.locale).toEqual('en-US');
  });

  it('should dispatch the fetchInterface action', () => {
    expect(fetchInterfaceSpy).toHaveBeenCalledTimes(1);
  });

  it('exposes an #executeFirstSearch method', () => {
    expect(engine.executeFirstSearch).toBeTruthy();
  });

  it('should ensure that engine.relay is the same reference as thunk extra args relay', async () => {
    const thunkRelay = await engine.dispatch(
      (_dispatch, _getState, extra) => extra.relay
    );

    expect(thunkRelay).toBe(engine.relay);
  });
});
