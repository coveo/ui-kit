import {getSampleSearchEngineConfiguration} from '@coveo/headless';
import {defineSearchEngine, InferHydrationResult} from '@coveo/headless/ssr';

const engineDefinition = defineSearchEngine({
  configuration: {
    ...getSampleSearchEngineConfiguration(),
    analytics: {enabled: false},
  },
  controllers: {},
});

export type SearchHydrationResult = InferHydrationResult<
  typeof engineDefinition
>;

export const {fetchInitialState, hydrateInitialState} = engineDefinition;
