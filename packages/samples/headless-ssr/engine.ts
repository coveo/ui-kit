import {getSampleSearchEngineConfiguration} from '@coveo/headless';
import {defineSearchEngine} from '@coveo/headless/ssr';

export const {fetchInitialState, hydrateInitialState} = defineSearchEngine({
  configuration: {
    ...getSampleSearchEngineConfiguration(),
    analytics: {enabled: false},
  },
  controllers: {},
});
