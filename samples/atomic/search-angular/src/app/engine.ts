import {buildSearchEngine, getSampleSearchEngineConfiguration} from '@coveo/headless';

/**
 * Builds a search engine with the public `searchuisamples` sample credentials
 * (safe to share), pointed at the `BarcaKnowledge` knowledge-base search hub.
 * When you initialize the interface with your own engine, set the search hub
 * here rather than through the `search-hub` attribute. To use this sample as an
 * MRE, replace the configuration with your own `organizationId`/`accessToken`
 * and hub/pipeline.
 */
export function buildEngine() {
  return buildSearchEngine({
    configuration: {
      ...getSampleSearchEngineConfiguration(),
      search: {
        searchHub: 'BarcaKnowledge',
      },
    },
  });
}
