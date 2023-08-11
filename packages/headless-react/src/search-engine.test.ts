import {getSampleSearchEngineConfiguration} from '@coveo/headless';
import {defineSearchEngine} from './search-engine';

describe('Headless react SSR utils', () => {
  it('defines react search engine', () => {
    const config = getSampleSearchEngineConfiguration();
    const {
      fetchInitialState,
      hydrateInitialState,
      build,
      useEngine,
      controllers,
      SSRStateProvider,
      CSRProvider,
      ...rest
    } = defineSearchEngine({
      configuration: config,
    });

    [
      fetchInitialState,
      hydrateInitialState,
      build,
      useEngine,
      SSRStateProvider,
      CSRProvider,
    ].forEach((returnValue) => expect(typeof returnValue).toBe('function'));

    expect(controllers).toEqual({});
    expect(rest).toEqual({}); // No other return values
  });
});
