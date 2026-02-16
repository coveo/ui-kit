/* lib/getSearchEngine.ts */
import {
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
  type SearchEngine,
  type SearchEngineOptions,
} from '@coveo/headless';

export const getSearchEngine = (): SearchEngine => {
  const searchEngineOptions: SearchEngineOptions = {
    configuration: {
      ...getSampleSearchEngineConfiguration(),
      search: {
        pipeline: 'genqatest',
      },
    },
  }; // callout[Refer to <a href="#instantiating-the-engine-and-the-controller">Instantiating the engine and the controller</a> to better understand your `searchEngine` controller. The above example is not intended for production use.]

  return buildSearchEngine(searchEngineOptions);
};
