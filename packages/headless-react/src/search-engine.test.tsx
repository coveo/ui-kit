import {getSampleSearchEngineConfiguration} from '@coveo/headless';
import {defineResultList, defineSearchBox} from '@coveo/headless/ssr';
import {render, renderHook, screen} from '@testing-library/react';
import {PropsWithChildren} from 'react';
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
      useEngine,
    } = engineDefinition;

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

    function checkRenderError(
      renderFunction: CallableFunction,
      expectedErrMsg: string
    ) {
      let err = undefined;
      // Prevent expected error from being thrown in console when running tests
      const consoleErrorStub = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      try {
        renderFunction();
      } catch (e) {
        err = e as Error;
      } finally {
        consoleErrorStub.mockReset();
      }

      expect(err?.message).toBe(expectedErrMsg);
    }

    test('should throw error when controller hook is used without context', () => {
      checkRenderError(
        () => render(<TestResultList />),
        MissingEngineProviderError.message
      );
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

    test('should hydrate results with CSRProvider', async () => {
      const ssrState = await fetchInitialState();
      const {engine, controllers} = await hydrateInitialState(ssrState);

      render(
        <CSRProvider engine={engine} controllers={controllers}>
          <TestResultList />
        </CSRProvider>
      );

      await checkRenderedResultList();
    });

    describe('useEngine hook', () => {
      test('should throw error with no context', async () => {
        checkRenderError(
          () => renderHook(() => useEngine()),
          MissingEngineProviderError.message
        );
      });

      test('should not return engine with SSRProvider', async () => {
        const ssrState = await fetchInitialState();
        function ssrStateProviderWrapper({children}: PropsWithChildren) {
          return (
            <SSRStateProvider controllers={ssrState.controllers}>
              {children}
            </SSRStateProvider>
          );
        }

        const {result} = renderHook(() => useEngine(), {
          wrapper: ssrStateProviderWrapper,
        });
        expect(result.current).toBeUndefined();
      });

      test('should return engine with CSRProvider', async () => {
        const ssrState = await fetchInitialState();
        const {engine, controllers} = await hydrateInitialState(ssrState);
        function csrStateProviderWrapper({children}: PropsWithChildren) {
          return (
            <CSRProvider controllers={controllers} engine={engine}>
              {children}
            </CSRProvider>
          );
        }

        const {result} = renderHook(() => useEngine(), {
          wrapper: csrStateProviderWrapper,
        });
        expect(result.current).toStrictEqual(engine);
      });
    });
  });
});
