import {getSampleSearchEngineConfiguration} from '@coveo/headless';
import {
  InferCSRState,
  defineResultList,
  defineSearchBox,
} from '@coveo/headless/ssr';
import '@testing-library/jest-dom';
import {render, screen} from '@testing-library/react';
import {useEffect, useState} from 'react';
import {MissingEngineProviderError, defineSearchEngine} from './search-engine';

describe('Headless react SSR utils', () => {
  let errorSpy: jest.SpyInstance;
  const sampleConfig = {
    ...getSampleSearchEngineConfiguration(),
    analytics: {enabled: false}, // TODO: KIT-2585 Remove after analytics SSR support is added
  };

  beforeEach(() => {
    errorSpy = jest.spyOn(console, 'error');
  });

  afterEach(() => {
    errorSpy.mockClear();
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
      controllers: {
        resultList: defineResultList(),
        searchBox: defineSearchBox(),
      },
    });
    expect(typeof controllers.useResultList).toEqual('function');
    expect(typeof controllers.useSearchBox).toEqual('function');
  });

  describe('context providers', () => {
    const resultItemTestId = 'result-item';
    const numResults = 10;
    const engineDefinition = defineSearchEngine({
      configuration: sampleConfig,
      controllers: {resultList: defineResultList()},
    });
    const {
      fetchInitialState,
      hydrateInitialState,
      SSRStateProvider,
      CSRProvider,
      controllers,
    } = engineDefinition;

    type CSRSearchState = InferCSRState<typeof engineDefinition>;

    function TestResultList() {
      const {state} = controllers.useResultList();
      return (
        <ul>
          {state.results.map((result) => (
            <li key={result.uniqueId} data-testid={resultItemTestId}>
              {result.title}
            </li>
          ))}
        </ul>
      );
    }

    async function checkRenderedResultList() {
      const results = await screen.findAllByTestId(resultItemTestId);
      expect(errorSpy).not.toHaveBeenCalled();
      expect(results).toHaveLength(numResults);
    }

    test('should throw error when controller hook is used without context', () => {
      let err = undefined;
      // Prevent expected error from being thrown in console when running tests
      const consoleErrorStub = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      try {
        render(<TestResultList />);
      } catch (e) {
        err = e as Error;
      } finally {
        consoleErrorStub.mockReset();
      }

      expect(err?.message).toBe(MissingEngineProviderError.message);
    });

    test('should render with SSRProvider', async () => {
      const ssrState = await fetchInitialState();
      render(
        <SSRStateProvider controllers={ssrState.controllers}>
          <TestResultList />
        </SSRStateProvider>
      );

      await checkRenderedResultList();
    });

    test('should render with CSRProvider', async () => {
      const ssrState = await fetchInitialState();

      function TestResultsPage() {
        const [csrResult, setCSRResult] = useState<CSRSearchState | undefined>(
          undefined
        );
        useEffect(() => {
          hydrateInitialState(ssrState).then(({engine, controllers}) => {
            setCSRResult({engine, controllers});
          });
        });

        return (
          csrResult && (
            <CSRProvider
              engine={csrResult.engine}
              controllers={csrResult.controllers}
            >
              <TestResultList />
            </CSRProvider>
          )
        );
      }

      render(<TestResultsPage />);

      await checkRenderedResultList();
    });
  });
});
