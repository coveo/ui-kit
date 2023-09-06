import {getSampleSearchEngineConfiguration} from '@coveo/headless';
import {
  defineSearchEngine,
  defineResultList,
  InferSSRState,
  InferCSRState,
  defineSearchBox,
  defineSearchParameterManager,
} from '@coveo/headless/ssr';

const engineDefinition = defineSearchEngine({
  configuration: {
    ...getSampleSearchEngineConfiguration(),
    analytics: {enabled: false},
  },
  controllers: {
    searchBox: defineSearchBox(),
    resultList: defineResultList(),
    searchParameters: defineSearchParameterManager(),
  },
});

export type SearchSSRState = InferSSRState<typeof engineDefinition>;
export type SearchCSRState = InferCSRState<typeof engineDefinition>;

export const {fetchInitialState, hydrateInitialState} = engineDefinition;
