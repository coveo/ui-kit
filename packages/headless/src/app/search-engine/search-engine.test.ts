import {enableDebug} from '../../features/debug/debug-actions.js';
import {setSearchHub} from '../../features/search-hub/search-hub-actions.js';
import {
  buildSearchEngine,
  type SearchEngine,
  type SearchEngineOptions,
} from './search-engine.js';
import {getSampleSearchEngineConfiguration} from './search-engine-configuration.js';

describe('searchEngine', () => {
  let engine: SearchEngine;
  describe('buildSearchEngine', () => {
    let options: SearchEngineOptions;

    function initEngine() {
      engine = buildSearchEngine(options);
    }

    beforeEach(() => {
      options = {
        configuration: getSampleSearchEngineConfiguration(),
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

    describe('validating the search configuration', () => {
      it('passing an empty pipeline does not throw', () => {
        options.configuration.search!.pipeline = '';
        expect(initEngine).not.toThrow();
      });

      it('passing an empty searchHub throws', () => {
        options.configuration.search!.searchHub = '';
        expect(initEngine).toThrow();
      });

      it('passing an empty locale throws', () => {
        options.configuration.search!.locale = '';
        expect(initEngine).toThrow();
      });

      it('passing an empty timezone throws', () => {
        options.configuration.search!.timezone = '';
        expect(initEngine).toThrow();
      });

      it('passing an empty authenticationProviders array does not throw', () => {
        options.configuration.search!.authenticationProviders = [];
        expect(initEngine).not.toThrow();
      });

      it('passing an empty string in the authenticationProviders array throws', () => {
        options.configuration.search!.authenticationProviders = [''];
        expect(initEngine).toThrow();
      });

      it('passing an invalid URL in the proxyBaseUrl throws', () => {
        options.configuration.search!.proxyBaseUrl = 'invalid-url';
        expect(initEngine).toThrow();
      });

      it('passing a valid URL in the proxyBaseUrl does not throw', () => {
        options.configuration.search!.proxyBaseUrl = 'https://example.com';
        expect(initEngine).not.toThrow();
      });
    });

    it('exposes an #executeFirstSearch method', () => {
      expect(engine.executeFirstSearch).toBeTruthy();
    });

    it('exposes an #executeFirstSearchAfterStandaloneSearchBoxRedirect method', () => {
      expect(
        engine.executeFirstSearchAfterStandaloneSearchBoxRedirect
      ).toBeTruthy();
    });

    it('is possible to change the search hub', () => {
      const initialSearchHub = engine.state.searchHub;
      engine.dispatch(setSearchHub('newHub'));
      expect(engine.state.searchHub).not.toBe(initialSearchHub);
    });

    it('is possible to toggle debug mode', () => {
      expect(engine.state.debug).toBe(false);
      engine.dispatch(enableDebug());
      expect(engine.state.debug).toBe(true);
    });

    describe('when passing a search configuration', () => {
      const pipeline = 'newPipe';
      const searchHub = 'newHub';
      const locale = 'fr';
      const timezone = 'Africa/Johannesburg';
      const proxyBaseUrl = 'https://example.com/search';

      beforeEach(() => {
        options.configuration.search = {
          pipeline,
          searchHub,
          locale,
          timezone,
          proxyBaseUrl,
        };

        initEngine();
      });

      it('sets the pipeline correctly', () => {
        expect(engine.state.pipeline).toBe(pipeline);
      });

      it('sets the searchHub correctly', () => {
        expect(engine.state.searchHub).toBe(searchHub);
      });

      it('sets the searchHub correctly', () => {
        expect(engine.state.configuration.search.locale).toBe(locale);
      });

      it('sets the timezone correctly', () => {
        expect(engine.state.configuration.search.timezone).toBe(timezone);
      });

      it('sets the apiBaseUrl correctly', () => {
        expect(engine.state.configuration.search.apiBaseUrl).toBe(proxyBaseUrl);
      });
    });

    it('should ensure that engine.relay is the same reference as thunk extra args relay', async () => {
      const thunkRelay = await engine.dispatch(
        (_dispatch, _getState, extra) => extra.relay
      );

      expect(thunkRelay).toBe(engine.relay);
    });
  });
});
