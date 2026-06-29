import {
  getSampleSearchEngineConfiguration,
  type SearchEngineConfiguration,
} from '@coveo/headless';

/**
 * The search hub identifying the search interface from which queries originate.
 * It selects the query pipeline and ML models associated with the BarcaKnowledge
 * knowledge base, and is logged as `originLevel1` in usage analytics.
 *
 * See https://docs.coveo.com/en/1707 for more information on search hubs.
 */
export const searchHub = 'BarcaKnowledge';

/**
 * Returns the search engine configuration used across the sample.
 *
 * It builds on the public sample organization credentials and points the
 * interface at the `BarcaKnowledge` search hub.
 */
export function getEngineConfiguration(): SearchEngineConfiguration {
  const sampleConfiguration = getSampleSearchEngineConfiguration();

  return {
    ...sampleConfiguration,
    search: {
      ...sampleConfiguration.search,
      searchHub,
    },
  };
}
