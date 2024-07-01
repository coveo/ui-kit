import {getOrganizationEndpoints} from '../../api/platform-client';
import {enableDebug} from '../../features/debug/debug-actions';
import {setSearchHub} from '../../features/search-hub/search-hub-actions';
import {
  buildSearchEngine,
  SearchEngine,
  SearchEngineOptions,
} from './search-engine';
import {getSampleSearchEngineConfiguration} from './search-engine-configuration';

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

    it('passing an invalid searchHub throws', () => {
      options.configuration.search!.searchHub = '';
      expect(initEngine).toThrow();
    });

    it('passing an empty pipeline does not throw', () => {
      options.configuration.search!.pipeline = '';
      expect(initEngine).not.toThrow();
    });

    it('exposes an #executeFirstSearch method', () => {
      expect(engine.executeFirstSearch).toBeTruthy();
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

    describe('organizationEndpoints', () => {
      it('configures proper url when #getOrganizationEndpoints is used', () => {
        const engine = buildSearchEngine({
          configuration: {
            accessToken: 'foo',
            organizationId: 'bar',
            organizationEndpoints: getOrganizationEndpoints('bar'),
          },
        });

        expect(engine.state.configuration.platformUrl).toBe(
          'https://bar.org.coveo.com'
        );
        expect(engine.state.configuration.search.apiBaseUrl).toBe(
          'https://bar.org.coveo.com/rest/search/v2'
        );
        expect(engine.state.configuration.analytics.apiBaseUrl).toBe(
          'https://bar.analytics.org.coveo.com'
        );
      });

      it('configures proper url when analytics and search are not on the same base platform URL', () => {
        const engine = buildSearchEngine({
          configuration: {
            accessToken: 'foo',
            organizationId: 'bar',
            organizationEndpoints: {
              search: 'https://my-custom-proxy.com',
              analytics: 'https://myorg.analytics.org.coveo.com',
              platform: 'https://myorg.org.coveo.com',
            },
          },
        });

        expect(engine.state.configuration.platformUrl).toBe(
          'https://myorg.org.coveo.com'
        );
        expect(engine.state.configuration.search.apiBaseUrl).toBe(
          'https://my-custom-proxy.com'
        );
        expect(engine.state.configuration.analytics.apiBaseUrl).toBe(
          'https://myorg.analytics.org.coveo.com'
        );
      });

      it('configures proper url when deprecated #platformUrl is used', () => {
        const engine = buildSearchEngine({
          configuration: {
            accessToken: 'foo',
            organizationId: 'bar',
            platformUrl: 'https://platform-eu.cloud.coveo.com',
          },
        });

        expect(engine.state.configuration.platformUrl).toBe(
          'https://platform-eu.cloud.coveo.com'
        );
        expect(engine.state.configuration.search.apiBaseUrl).toBe(
          'https://platform-eu.cloud.coveo.com/rest/search/v2'
        );
        expect(engine.state.configuration.analytics.apiBaseUrl).toBe(
          'https://analytics-eu.cloud.coveo.com/rest/ua'
        );
      });
    });

    describe('answer config', () => {
      it('will dispatch an action to update the answer config if present in the options', () => {
        const answerConfigurationId = 'answerConfigId';
        options.configuration.answerConfigurationId = answerConfigurationId;
        initEngine();

        expect(engine.state.configuration.knowledge.answerConfigurationId).toBe(
          answerConfigurationId
        );
      });
      it('will not dispatch an action to update the answer config if not present in the options', () => {
        initEngine();

        expect(engine.state.configuration.knowledge.answerConfigurationId).toBe(
          ''
        );
      });
    });

    describe('when passing a search configuration', () => {
      const pipeline = 'newPipe';
      const searchHub = 'newHub';
      const locale = 'fr';
      const timezone = 'Africa/Johannesburg';

      beforeEach(() => {
        options.configuration.search = {
          pipeline,
          searchHub,
          locale,
          timezone,
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
    });
  });
});
