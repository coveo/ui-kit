import {getSampleSearchEngineConfiguration} from '@coveo/headless';
import {
  defineSearchEngine,
  defineResultList,
  InferInitialState,
  InferLiveState,
} from '@coveo/headless/ssr';

const engineDefinition = defineSearchEngine({
  configuration: {
    ...getSampleSearchEngineConfiguration(),
    analytics: {enabled: false},
  },
  controllers: {resultList: defineResultList()},
});

export type SearchInitialState = InferInitialState<typeof engineDefinition>;
export type SearchLiveState = InferLiveState<typeof engineDefinition>;

export const {fetchInitialState, hydrateInitialState} = engineDefinition;
