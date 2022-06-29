import {buildSamlClient} from '@coveo/auth';
import {enableDebug} from '../../features/debug/debug-actions';
import {setSearchHub} from '../../features/search-hub/search-hub-actions';
import {
  buildSearchEngine,
  buildSearchEngineWithSamlAuthentication,
  SearchEngine,
  SearchEngineOptions,
} from './search-engine';
import {getSampleSearchEngineConfiguration} from './search-engine-configuration';
jest.mock('@coveo/auth');

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

    it('passing an invalid pipeline throws', () => {
      options.configuration.search!.pipeline = '';
      expect(initEngine).toThrow();
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

  describe('buildSearchEngineWithSamlAuthentication', () => {
    beforeAll(() => {
      (buildSamlClient as jest.Mock).mockImplementation(() => ({
        authenticate: () => Promise.resolve('theToken'),
      }));
    });

    it('sets the authentication provider and token correctly', async () => {
      engine = await buildSearchEngineWithSamlAuthentication({
        configuration: {
          organizationId: 'theOrg',
          provider: 'theProvider',
        },
      });

      expect(engine.state.configuration.search.authenticationProviders[0]).toBe(
        'theProvider'
      );
      expect(engine.state.configuration.accessToken).toBe('theToken');
    });

    it('passes down generic engine options correctly', async () => {
      engine = await buildSearchEngineWithSamlAuthentication({
        configuration: {
          organizationId: 'theOrg',
          provider: 'theProvider',
          analytics: {enabled: false},
          search: {
            pipeline: 'thePipeline',
          },
        },
      });
    });
  });
});
