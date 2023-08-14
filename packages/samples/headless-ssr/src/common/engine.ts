import {getSampleSearchEngineConfiguration} from '@coveo/headless';
import {
  defineSearchEngine,
  defineResultList,
  InferSSRState,
  InferCSRState,
  defineSearchBox,
} from '@coveo/headless/ssr';

const engineDefinition = defineSearchEngine({
  configuration: {
    ...getSampleSearchEngineConfiguration(),
    analytics: {enabled: false},
  },
  controllers: {
    searchBox: defineSearchBox({options: {numberOfSuggestions: 4}}),
    resultList: defineResultList(),
  },
});

export type SearchSSRState = InferSSRState<typeof engineDefinition>;
export type SearchCSRState = InferCSRState<typeof engineDefinition>;

export const {fetchInitialState, hydrateInitialState} = engineDefinition;
