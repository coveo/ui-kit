import {buildResultList} from '../../controllers';
import {loadPaginationActions} from '../../product-listing.index';
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

    it('returns 3 functions (where two are composite)', () => {
      const {build, fetchStaticState, hydrateStaticState} = engineDefinition;
      expect(typeof build).toBe('function');
      expect(typeof fetchStaticState).toBe('function');
      expect(typeof hydrateStaticState).toBe('function');
      expect(typeof fetchStaticState.fromBuildResult).toBe('function');
      expect(typeof hydrateStaticState.fromBuildResult).toBe('function');
    });

    it('get build result', async () => {
      const {build} = engineDefinition;
      const buildResult = await build();
      expect(buildResult.engine).toBeTruthy();
      expect(buildResult.controllers).toBeTruthy();
    });

    it('fetches initial state of engine', async () => {
      const {fetchStaticState} = engineDefinition;
      const engineStaticState = await fetchStaticState();
      expect(engineStaticState).toBeTruthy();
    });

    it('from build result, fetches initial state of engine', async () => {
      const {build, fetchStaticState} = engineDefinition;
      const buildResult = await build();
      const engineStaticState = await fetchStaticState.fromBuildResult({
        buildResult,
      });
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

    it('from build result, hydrates engine and fetches results using hydrated engine', async () => {
      const {build, fetchStaticState, hydrateStaticState} = engineDefinition;
      const buildResult = await build();
      const engineStaticState = await fetchStaticState.fromBuildResult({
        buildResult,
      });
      const {engine} = await hydrateStaticState.fromBuildResult({
        buildResult,
        searchAction: engineStaticState.searchAction,
      });
      expect(engine.state.configuration.organizationId).toEqual(
        getSampleSearchEngineConfiguration().organizationId
      );

      const resultList = buildResultList(engine);
      expect(resultList.state.results.length).toBe(10);
    });

    it('can dispatch an action on both the server side and client side engine', async () => {
      const numberOfResults = 6;
      const {build, fetchStaticState, hydrateStaticState} = engineDefinition;
      async function fetchBuildResult() {
        const buildResult = await build();
        const {registerNumberOfResults} = loadPaginationActions(
          buildResult.engine
        );
        buildResult.engine.dispatch(registerNumberOfResults(numberOfResults));
        return buildResult;
      }

      const engineStaticState = await fetchStaticState.fromBuildResult({
        buildResult: await fetchBuildResult(),
      });
      const {engine} = await hydrateStaticState.fromBuildResult({
        buildResult: await fetchBuildResult(),
        searchAction: engineStaticState.searchAction,
      });
      expect(engine.state.pagination!.numberOfResults).toBe(numberOfResults);
      expect(engine.state.search.results.length).toBe(numberOfResults);
    });
  });
});
