import {getSampleSearchEngineConfiguration} from '@coveo/headless';
import {
  defineSearchEngine,
  defineResultList,
  InferSSRState,
  InferCSRState,
} from '@coveo/headless/ssr';

const engineDefinition = defineSearchEngine({
  configuration: {
    ...getSampleSearchEngineConfiguration(),
    analytics: {enabled: false},
  },
  controllers: {resultList: defineResultList()},
});

export type SearchSSRState = InferSSRState<typeof engineDefinition>;
export type SearchCSRState = InferCSRState<typeof engineDefinition>;

export const {fetchInitialState, hydrateInitialState} = engineDefinition;
