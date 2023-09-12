import {buildResultList} from '../../controllers';
import {getSampleSearchEngineConfiguration} from './search-engine';
import {SearchEngineDefinition, defineSearchEngine} from './search-engine.ssr';

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
      const {build, fetchStaticState, hydrateStaticState} = engineDefinition;
      expect(typeof build).toBe('function');
      expect(typeof fetchStaticState).toBe('function');
      expect(typeof hydrateStaticState).toBe('function');
    });

    it('fetches initial state of engine', async () => {
      const {fetchStaticState} = engineDefinition;
      const engineStaticState = await fetchStaticState();
      expect(engineStaticState).toBeTruthy();
    });

    it('hydrates engine and fetches results using hydrated engine', async () => {
      const {fetchStaticState, hydrateStaticState} = engineDefinition;
      const engineStaticState = await fetchStaticState();
      const {engine} = await hydrateStaticState(engineStaticState);
      expect(engine.state.configuration.organizationId).toEqual(
        getSampleSearchEngineConfiguration().organizationId
      );

      const resultList = buildResultList(engine);
      expect(resultList.state.results.length).toBe(10);
    });
  });
});
