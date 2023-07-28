import {getSampleSearchEngineConfiguration} from '../search-engine/search-engine';
import {SearchEngineDefinition, defineSearchEngine} from './ssr-engine';

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

    it('fetches initial state', async () => {
      const {fetchInitialState} = engineDefinition;
      const engineSnapshot = await fetchInitialState({controllers});
      expect(engineSnapshot).toBeTruthy();
    });

    it('hydrates state', async () => {
      const {fetchInitialState, hydrateInitialState} = engineDefinition;
      const engineSnapshot = await fetchInitialState({controllers});
      const {engine, controllers: hydratedControllers} =
        await hydrateInitialState(engineSnapshot);
      expect(engine.state.configuration.organizationId).toEqual(
        getSampleSearchEngineConfiguration().organizationId
      );
      expect(hydratedControllers).toStrictEqual(controllers);
    });
  });
});
