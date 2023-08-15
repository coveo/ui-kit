import {getSampleSearchEngineConfiguration} from '@coveo/headless';
import {defineResultList} from '@coveo/headless/ssr';
import '@testing-library/jest-dom';
import {render} from '@testing-library/react';
import {defineSearchEngine} from './search-engine';

describe('Headless react SSR utils', () => {
  // TODO: add test using `defineResultList` controller once https://github.com/coveo/ui-kit/pull/3099 is merged.

  let errorSpy: jest.SpyInstance;
  const sampleConfig = getSampleSearchEngineConfiguration();

  beforeEach(() => {
    errorSpy = jest.spyOn(global.console, 'error');
  });

  test('defines react search engine', () => {
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
      configuration: sampleConfig,
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

  test('creates a hook based on given controller', () => {
    const {controllers} = defineSearchEngine({
      configuration: sampleConfig,
      controllers: {resultList: defineResultList()},
    });
    expect(typeof controllers.useResultList).toEqual('function');
  });

  describe('renders providers without error', () => {
    const config = getSampleSearchEngineConfiguration();
    const {fetchInitialState, SSRStateProvider} = defineSearchEngine({
      configuration: config,
    });
    test('SSRProvider', async () => {
      const SSRControllers = await fetchInitialState({controllers: {}});

      render(<SSRStateProvider controllers={SSRControllers.controllers} />);
      expect(errorSpy).not.toHaveBeenCalled();
    });

    // TODO: Add CSR test
    // test('CSR Provider', () => {
    //   type CSRSearchState = Infer
    //   function useHydrate(SSRState) {
    //     const [CSRState, setCSRState] = useState(SearchCSRS)

    //   }
    //   function TestHydration() {

    //   }
    //   render(<CSRProvider engine={} controllers={}></CSRProvider>);
    //   expect(errorSpy).not.toHaveBeenCalled();
    //  })
  });
});
