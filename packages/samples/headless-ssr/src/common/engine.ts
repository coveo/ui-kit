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
  InferInitialState,
  InferLiveState,
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

export type SearchInitialState = InferInitialState<typeof engineDefinition>;
export type SearchLiveState = InferLiveState<typeof engineDefinition>;

export const {fetchInitialState, hydrateInitialState} = engineDefinition;
