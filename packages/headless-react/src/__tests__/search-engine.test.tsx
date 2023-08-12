import {getSampleSearchEngineConfiguration} from '@coveo/headless';
import '@testing-library/jest-dom';
import {render} from '@testing-library/react';
import {defineSearchEngine} from '../search-engine';

describe('Headless react SSR utils', () => {
  // TODO: add test using `defineResultList` controller once https://github.com/coveo/ui-kit/pull/3099 is merged.
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

  it('renders provider', async () => {
    const config = getSampleSearchEngineConfiguration();
    const {fetchInitialState, SSRStateProvider} = defineSearchEngine({
      configuration: config,
    });
    const SSRControllers = await fetchInitialState({controllers: {}});

    render(<SSRStateProvider controllers={SSRControllers.controllers} />);
  });
});
