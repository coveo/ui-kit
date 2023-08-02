import {buildResultList} from '../../controllers';
import {getSampleSearchEngineConfiguration} from '../search-engine/search-engine';
import {defineSearchEngine} from './ssr-engine';
import {SearchEngineDefinition} from './types/core-engine-ssr-types';

describe('SSR', () => {
  describe('define search engine', () => {
    const controllers = {};
    let engineDefinition: SearchEngineDefinition<typeof controllers>;
    beforeEach(() => {
      engineDefinition = defineSearchEngine({
        configuration: {
          ...getSampleSearchEngineConfiguration(),
          analytics: {enabled: false},
        },
        controllers,
      });
    });

    it('returns 3 functions', () => {
      const {build, fetchInitialState, hydrateInitialState} = engineDefinition;
      expect(typeof build).toBe('function');
      expect(typeof fetchInitialState).toBe('function');
      expect(typeof hydrateInitialState).toBe('function');
    });

    it('fetches engine snapshot', async () => {
      const {fetchInitialState} = engineDefinition;
      const engineSnapshot = await fetchInitialState({controllers});
      expect(engineSnapshot).toBeTruthy();
    });

    it('hydrates engine and fetches results using hydrated engine', async () => {
      const {fetchInitialState, hydrateInitialState} = engineDefinition;
      const engineSnapshot = await fetchInitialState({controllers});
      const {engine} = await hydrateInitialState(engineSnapshot);
      expect(engine.state.configuration.organizationId).toEqual(
        getSampleSearchEngineConfiguration().organizationId
      );

      const resultList = buildResultList(engine);
      expect(resultList.state.results.length).toBe(10);
    });
  });
});
