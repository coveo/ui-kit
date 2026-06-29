import {
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
  type SearchEngine,
} from '@coveo/headless';

/**
 * The search hub identifying the interface queries originate from. It selects
 * the query pipeline and ML models, and is logged as `originLevel1` in analytics.
 */
export const searchHub = 'BarcaKnowledge';

/**
 * Builds a search engine pointed at the public sample organization and the
 * `BarcaKnowledge` search hub.
 */
export function buildEngine(): SearchEngine {
  const sampleConfiguration = getSampleSearchEngineConfiguration();

  return buildSearchEngine({
    configuration: {
      ...sampleConfiguration,
      search: {
        ...sampleConfiguration.search,
        searchHub,
      },
    },
  });
}
