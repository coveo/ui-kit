import {
  buildController,
  getSampleSearchEngineConfiguration,
  SearchEngine,
} from '@coveo/headless';
import {defineSearchEngine, InferHydrationResult} from '@coveo/headless/ssr';

// Custom controller to fetch results from snapshot
//  as snapshot doesn't have an engine that can be accessed directly.
function defineCustomResultList() {
  return {
    build(engine: SearchEngine) {
      return {
        ...buildController(engine),
        get state() {
          return engine.state.search.results;
        },
      };
    },
  };
}

const engineDefinition = defineSearchEngine({
  configuration: {
    ...getSampleSearchEngineConfiguration(),
    analytics: {enabled: false},
  },
  controllers: {resultList: defineCustomResultList()},
});

export type SearchHydrationResult = InferHydrationResult<
  typeof engineDefinition
>;

export const {fetchInitialState, hydrateInitialState} = engineDefinition;
