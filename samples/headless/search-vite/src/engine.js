import {
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
} from '@coveo/headless';

/**
 * A single shared search engine for the app. It uses the Coveo sample
 * configuration pointed at the `BarcaKnowledge` search hub (a knowledge-base
 * catalog of robotics support articles).
 */
export const engine = buildSearchEngine({
  configuration: {
    ...getSampleSearchEngineConfiguration(),
    search: {
      searchHub: 'BarcaKnowledge',
    },
  },
});
