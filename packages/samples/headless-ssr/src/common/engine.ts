import {
  buildController,
  Controller,
  getSampleSearchEngineConfiguration,
  Result,
  SearchEngine,
} from '@coveo/headless';
import {
  ControllerDefinitionWithoutProps,
  defineSearchBox,
  defineSearchEngine,
  InferSSRState,
  InferCSRState,
} from '@coveo/headless/ssr';

// Custom controller to fetch results from snapshot
//  as snapshot doesn't have an engine that can be accessed directly.
function defineCustomResultList(): ControllerDefinitionWithoutProps<
  SearchEngine,
  Controller & {state: {results: Result[]}}
> {
  return {
    build(engine: SearchEngine) {
      return {
        ...buildController(engine),
        get state() {
          return {results: engine.state.search.results};
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
  controllers: {
    searchBox: defineSearchBox({options: {numberOfSuggestions: 4}}),
    resultList: defineCustomResultList(),
  },
});

export type SearchSSRState = InferSSRState<typeof engineDefinition>;
export type SearchCSRState = InferCSRState<typeof engineDefinition>;

export const {fetchInitialState, hydrateInitialState} = engineDefinition;
