import {
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
} from '@coveo/headless';

/**
 * A single shared search engine using the public `searchuisamples` sample
 * credentials pointed at the `BarcaKnowledge` knowledge-base search hub (richer,
 * more relevant results). To use this sample as an MRE, replace the
 * configuration with your own `organizationId`/`accessToken` and hub/pipeline.
 */
export const engine = buildSearchEngine({
  configuration: {
    ...getSampleSearchEngineConfiguration(),
    search: {
      searchHub: 'BarcaKnowledge',
    },
  },
});
