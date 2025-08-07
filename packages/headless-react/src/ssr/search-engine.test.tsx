import {randomUUID} from 'node:crypto';
import {
  defineResultList,
  defineSearchBox,
  getSampleSearchEngineConfiguration,
  type InferHydratedState,
  type InferStaticState,
  type NavigatorContextProvider,
  type Result,
} from '@coveo/headless/ssr';
import {act, render, renderHook, screen} from '@testing-library/react';
import type {PropsWithChildren} from 'react';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  type MockInstance,
  test,
  vi,
} from 'vitest';
import {MissingEngineProviderError} from '../errors.js';
import {defineSearchEngine} from './search-engine.js';

describe('Headless react SSR utils', () => {
  let errorSpy: MockInstance;
  const mockedNavigatorContextProvider: NavigatorContextProvider = () => {
    return {
      clientId: '123',
      location: 'https://www.example.com',
      referrer: 'https://www.google.com',
      userAgent: 'Mozilla/5.0',
    };
  };
  const sampleConfig = {
    ...getSampleSearchEngineConfiguration(),
    analytics: {enabled: false}, // TODO: KIT-2585 Remove after analytics SSR support is added
  };

  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error');
  });

  afterEach(async () => {
    errorSpy.mockClear();

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    vi.clearAllTimers();
    vi.clearAllMocks();
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
      StateProvider,
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
      StateProvider,
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
      StateProvider,
      controllers,
      setNavigatorContextProvider,
      useEngine,
    } = engineDefinition;

    let renderResult: ReturnType<typeof render> | null = null;

    afterEach(async () => {
      if (renderResult) {
        renderResult.unmount();
        renderResult = null;
      }

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });
    });

    function TestResultList() {
      const generateMockResult: () => Result = () => {
        return {
          absentTerms: [],
          clickUri: '',
          excerpt: '',
          excerptHighlights: [],
          firstSentences: '',
          firstSentencesHighlights: [],
          flags: '',
          hasHtmlVersion: false,
          isRecommendation: false,
          isTopResult: false,
          isUserActionView: false,
          percentScore: 0,
          printableUri: '',
          printableUriHighlights: [],
          rankingInfo: null,
          raw: {urihash: ''},
          score: 0,
          searchUid: '',
          summary: null,
          summaryHighlights: [],
          title: '',
          titleHighlights: [],
          uniqueId: randomUUID(),
          uri: '',
        };
      };

      const {state} = controllers.useResultList();

      state.results = Array.from({length: numResults}, generateMockResult);
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

      results.forEach((result) => result.remove());
    }

    function checkRenderError(
      renderFunction: CallableFunction,
      expectedErrMsg: string
    ) {
      let err: Error | undefined;
      // Prevent expected error from being thrown in console when running tests
      const consoleErrorStub = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      try {
        renderResult = renderFunction();
      } catch (e) {
        err = e! as Error;
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
      renderResult = render(
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

      renderResult = render(
        <HydratedStateProvider engine={engine} controllers={controllers}>
          <TestResultList />
        </HydratedStateProvider>
      );

      await checkRenderedResultList();
    });

    test('should render with StateProvider using static state', async () => {
      setNavigatorContextProvider(mockedNavigatorContextProvider);
      const staticState = await fetchStaticState();
      renderResult = render(
        <StateProvider controllers={staticState.controllers}>
          <TestResultList />
        </StateProvider>
      );

      await checkRenderedResultList();
    });

    test('should render with StateProvider using hydrated state', async () => {
      setNavigatorContextProvider(mockedNavigatorContextProvider);
      const staticState = await fetchStaticState();
      const {engine, controllers} = await hydrateStaticState(staticState);

      renderResult = render(
        <StateProvider engine={engine} controllers={controllers}>
          <TestResultList />
        </StateProvider>
      );

      await checkRenderedResultList();
    });

    describe('hooks', () => {
      let staticState: InferStaticState<typeof engineDefinition>;
      let hydratedState: InferHydratedState<typeof engineDefinition>;
      let hookRenderResult: ReturnType<typeof renderHook> | null = null;

      beforeEach(async () => {
        setNavigatorContextProvider(mockedNavigatorContextProvider);
        staticState = await fetchStaticState();
        hydratedState = await hydrateStaticState(staticState);
      });

      afterEach(() => {
        if (hookRenderResult) {
          hookRenderResult.unmount();
          hookRenderResult = null;
        }
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

      function stateProviderWrapperWithStaticState({
        children,
      }: PropsWithChildren) {
        return (
          <StateProvider controllers={staticState.controllers}>
            {children}
          </StateProvider>
        );
      }

      function stateProviderWrapperWithHydratedState({
        children,
      }: PropsWithChildren) {
        return (
          <StateProvider
            engine={hydratedState.engine}
            controllers={hydratedState.controllers}
          >
            {children}
          </StateProvider>
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
          hookRenderResult = renderHook(() => useEngine(), {
            wrapper: staticStateProviderWrapper,
          });
          expect(hookRenderResult.result.current).toBeUndefined();
        });

        test('should return engine with hydrated state provider', async () => {
          hookRenderResult = renderHook(() => useEngine(), {
            wrapper: hydratedStateProviderWrapper,
          });
          expect(hookRenderResult.result.current).toStrictEqual(
            hydratedState.engine
          );
        });

        test('should not return engine with StateProvider using static state', async () => {
          hookRenderResult = renderHook(() => useEngine(), {
            wrapper: stateProviderWrapperWithStaticState,
          });
          expect(hookRenderResult.result.current).toBeUndefined();
        });

        test('should return engine with StateProvider using hydrated state', async () => {
          hookRenderResult = renderHook(() => useEngine(), {
            wrapper: stateProviderWrapperWithHydratedState,
          });
          expect(hookRenderResult.result.current).toStrictEqual(
            hydratedState.engine
          );
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
            const controllerSpy = vi.spyOn(
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

        describe('with StateProvider (static state)', () => {
          test('should define state but not methods', () => {
            const {result} = renderHook(() => useSearchBox(), {
              wrapper: stateProviderWrapperWithStaticState,
            });
            expect(result.current.state).toBeDefined();
            expect(result.current?.methods).toBeUndefined();
          });
        });

        describe('with StateProvider (hydrated state)', () => {
          test('should define both state and methods', () => {
            const {result} = renderHook(() => useSearchBox(), {
              wrapper: stateProviderWrapperWithHydratedState,
            });
            expect(result.current.state).toBeDefined();
            expect(result.current?.methods).toBeDefined();
          });

          test.skip('should update state when method is called', () => {
            const {result} = renderHook(() => useSearchBox(), {
              wrapper: stateProviderWrapperWithHydratedState,
            });
            const initialState = result.current.state;
            const controllerSpy = vi.spyOn(
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
