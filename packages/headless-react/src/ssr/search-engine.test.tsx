import {
  getSampleSearchEngineConfiguration,
  InferStaticState,
  InferHydratedState,
  defineResultList,
  defineSearchBox,
} from '@coveo/headless/ssr';
import {act, render, renderHook, screen} from '@testing-library/react';
import {PropsWithChildren} from 'react';
import {MissingEngineProviderError} from './common.js';
import {defineSearchEngine} from './search-engine.js';

describe('Headless react SSR utils', () => {
  let errorSpy: jest.SpyInstance;
  const mockedNavigatorContextProvider = jest.fn();
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
      fetchStaticState,
      hydrateStaticState,
      build,
      useEngine,
      controllers,
      StaticStateProvider,
      HydratedStateProvider,
      setNavigatorContextProvider,
      ...rest
    } = defineSearchEngine({
      configuration: sampleConfig,
    });

    [
      fetchStaticState,
      hydrateStaticState,
      build,
      useEngine,
      StaticStateProvider,
      HydratedStateProvider,
      setNavigatorContextProvider,
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
      // TODO: Generalize tests to test all defined controllers dynamically
      controllers: {
        resultList: defineResultList(),
        searchBox: defineSearchBox(),
      },
    });
    const {
      fetchStaticState,
      hydrateStaticState,
      StaticStateProvider,
      HydratedStateProvider,
      controllers,
      setNavigatorContextProvider,
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

    test('should render with StaticStateProvider', async () => {
      setNavigatorContextProvider(mockedNavigatorContextProvider);
      const staticState = await fetchStaticState();
      render(
        <StaticStateProvider controllers={staticState.controllers}>
          <TestResultList />
        </StaticStateProvider>
      );

      await checkRenderedResultList();
    });

    test('should hydrate results with HydratedStateProvider', async () => {
      setNavigatorContextProvider(mockedNavigatorContextProvider);
      const staticState = await fetchStaticState();
      const {engine, controllers} = await hydrateStaticState(staticState);

      render(
        <HydratedStateProvider engine={engine} controllers={controllers}>
          <TestResultList />
        </HydratedStateProvider>
      );

      await checkRenderedResultList();
    });

    describe('hooks', () => {
      let staticState: InferStaticState<typeof engineDefinition>;
      let hydratedState: InferHydratedState<typeof engineDefinition>;

      beforeEach(async () => {
        setNavigatorContextProvider(mockedNavigatorContextProvider);
        staticState = await fetchStaticState();
        hydratedState = await hydrateStaticState(staticState);
      });

      function staticStateProviderWrapper({children}: PropsWithChildren) {
        return (
          <StaticStateProvider controllers={staticState.controllers}>
            {children}
          </StaticStateProvider>
        );
      }

      function hydratedStateProviderWrapper({children}: PropsWithChildren) {
        return (
          <HydratedStateProvider
            controllers={hydratedState.controllers}
            engine={hydratedState.engine}
          >
            {children}
          </HydratedStateProvider>
        );
      }

      describe('useEngine hook', () => {
        test('should throw error with no context', async () => {
          checkRenderError(
            () => renderHook(() => useEngine()),
            MissingEngineProviderError.message
          );
        });

        test('should not return engine with static state provider', async () => {
          const {result} = renderHook(() => useEngine(), {
            wrapper: staticStateProviderWrapper,
          });
          expect(result.current).toBeUndefined();
        });

        test('should return engine with hydrated state provider', async () => {
          const {result} = renderHook(() => useEngine(), {
            wrapper: hydratedStateProviderWrapper,
          });
          expect(result.current).toStrictEqual(hydratedState.engine);
        });
      });

      describe('controller hooks', () => {
        // TODO: Generalize to loop through all defined controllers dynamically
        const {useSearchBox} = engineDefinition.controllers;
        describe('with StaticStateProvider', () => {
          test('should define state but not methods', () => {
            const {result} = renderHook(() => useSearchBox(), {
              wrapper: staticStateProviderWrapper,
            });
            expect(result.current.state).toBeDefined();
            expect(result.current?.methods).toBeUndefined();
          });
        });

        describe('with HydratedStateProvider', () => {
          test('should define both state and methods', () => {
            const {result} = renderHook(() => useSearchBox(), {
              wrapper: hydratedStateProviderWrapper,
            });
            expect(result.current.state).toBeDefined();
            expect(result.current?.methods).toBeDefined();
          });

          // TODO(DEBUG): hydratedState might need to be passed into the wrapper
          test.skip('should update state when method is called', () => {
            const {result} = renderHook(() => useSearchBox(), {
              wrapper: hydratedStateProviderWrapper,
            });
            const initialState = result.current.state;
            const controllerSpy = jest.spyOn(
              hydratedState.controllers.searchBox,
              'updateText'
            );
            act(() => {
              result.current.methods?.updateText('foo');
            });

            expect(controllerSpy).toHaveBeenCalledWith('foo');
            expect(initialState).not.toStrictEqual(result.current.state);
            expect(result.current.state.value).toBe('foo');
          });
        });
      });
    });
  });
});
