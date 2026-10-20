import {
  getSampleSearchEngineConfiguration,
  type SearchEngine,
  type SearchEngineDefinitionOptions,
} from '@coveo/headless/ssr-next';
import {render, renderHook} from '@testing-library/react';
import type {PropsWithChildren} from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {createMockSearchEngine} from '../__tests__/mock-ssr-engine.js';
import {defineMockSearchController} from '../__tests__/mock-ssr-controller-definitions.js';
import {MissingEngineProviderError, UndefinedControllerError} from '../errors.js';
import {defineSearchEngine} from './search-engine.js';

describe('defineSearchEngine', () => {
  const definitionOptions = {
    configuration: getSampleSearchEngineConfiguration(),
    controllers: {searchBox: defineMockSearchController()},
  } satisfies SearchEngineDefinitionOptions<{
    searchBox: ReturnType<typeof defineMockSearchController>;
  }>;

  const staticControllers = {
    searchBox: {state: {value: 'static query'}},
    parameterManager: {state: {parameters: {}}},
  };
  const liveControllers = {
    searchBox: {
      state: {value: 'hydrated query'},
      subscribe: vi.fn(() => vi.fn()),
      updateText: vi.fn(),
    },
    parameterManager: {state: {parameters: {}}, subscribe: vi.fn(() => vi.fn())},
  };

  let engine: SearchEngine;

  beforeEach(() => {
    engine = createMockSearchEngine() as unknown as SearchEngine;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const wrapperWith = (
    StateProvider: ReturnType<typeof defineSearchEngine>['searchEngineDefinition']['StateProvider'],
    props: {engine?: SearchEngine; controllers: object; hydrationError?: unknown}
  ) =>
    function Wrapper({children}: PropsWithChildren) {
      return (
        <StateProvider
          engine={props.engine}
          controllers={props.controllers as never}
          hydrationError={props.hydrationError}
        >
          {children}
        </StateProvider>
      );
    };

  it('should return the search and standalone engine definitions with a shared StateProvider', () => {
    const {searchEngineDefinition, standaloneEngineDefinition} =
      defineSearchEngine(definitionOptions);

    expect(searchEngineDefinition.fetchStaticState).toBeTypeOf('function');
    expect(searchEngineDefinition.hydrateStaticState).toBeTypeOf('function');
    expect(standaloneEngineDefinition.fetchStaticState).toBeTypeOf('function');
    expect(standaloneEngineDefinition.hydrateStaticState).toBeTypeOf('function');
    expect(searchEngineDefinition.StateProvider).toBe(standaloneEngineDefinition.StateProvider);
  });

  it('should expose one hook per controller, including the baked-in parameter manager', () => {
    const {controllers} = defineSearchEngine(definitionOptions);

    expect(controllers.useSearchBox).toBeTypeOf('function');
    expect(controllers.useParameterManager).toBeTypeOf('function');
  });

  it('should throw a MissingEngineProviderError when a hook is used outside the provider', () => {
    const {controllers} = defineSearchEngine(definitionOptions);
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => controllers.useSearchBox())).toThrow(MissingEngineProviderError);
  });

  it('should throw an UndefinedControllerError when the provider has no such controller', () => {
    const {controllers, searchEngineDefinition} = defineSearchEngine(definitionOptions);
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() =>
      renderHook(() => controllers.useSearchBox(), {
        wrapper: wrapperWith(searchEngineDefinition.StateProvider, {controllers: {}}),
      })
    ).toThrow(UndefinedControllerError);
  });

  describe('with the static state', () => {
    it('should return the controller state and no methods', () => {
      const {controllers, searchEngineDefinition} = defineSearchEngine(definitionOptions);

      const {result} = renderHook(() => controllers.useSearchBox(), {
        wrapper: wrapperWith(searchEngineDefinition.StateProvider, {
          controllers: staticControllers,
        }),
      });

      expect(result.current.state).toEqual({value: 'static query'});
      expect(result.current.methods).toBeUndefined();
    });

    it('should report no engine and a static hydration status', () => {
      const {useEngine, useHydration, searchEngineDefinition} =
        defineSearchEngine(definitionOptions);
      const wrapper = wrapperWith(searchEngineDefinition.StateProvider, {
        controllers: staticControllers,
      });

      expect(renderHook(() => useEngine(), {wrapper}).result.current).toBeUndefined();
      expect(renderHook(() => useHydration(), {wrapper}).result.current).toEqual({
        status: 'static',
      });
    });
  });

  describe('with the hydrated state', () => {
    it('should return the controller state and its methods', () => {
      const {controllers, searchEngineDefinition} = defineSearchEngine(definitionOptions);

      const {result} = renderHook(() => controllers.useSearchBox(), {
        wrapper: wrapperWith(searchEngineDefinition.StateProvider, {
          engine,
          controllers: liveControllers,
        }),
      });

      expect(result.current.state).toEqual({value: 'hydrated query'});
      result.current.methods?.updateText('new query');
      expect(liveControllers.searchBox.updateText).toHaveBeenCalledWith('new query');
    });

    it('should report the engine and a hydrated status', () => {
      const {useEngine, useHydration, searchEngineDefinition} =
        defineSearchEngine(definitionOptions);
      const wrapper = wrapperWith(searchEngineDefinition.StateProvider, {
        engine,
        controllers: liveControllers,
      });

      expect(renderHook(() => useEngine(), {wrapper}).result.current).toBe(engine);
      expect(renderHook(() => useHydration(), {wrapper}).result.current).toEqual({
        status: 'hydrated',
      });
    });
  });

  it('should report a hydration error through useHydration', () => {
    const {useHydration, searchEngineDefinition} = defineSearchEngine(definitionOptions);
    const error = new Error('hydration failed');

    const {result} = renderHook(() => useHydration(), {
      wrapper: wrapperWith(searchEngineDefinition.StateProvider, {
        controllers: staticControllers,
        hydrationError: error,
      }),
    });

    expect(result.current).toEqual({status: 'error', error});
  });

  it('should render children inside the StateProvider', () => {
    const {searchEngineDefinition} = defineSearchEngine(definitionOptions);
    const {StateProvider} = searchEngineDefinition;

    const {getByText} = render(
      <StateProvider controllers={staticControllers as never}>
        <span>child</span>
      </StateProvider>
    );

    expect(getByText('child')).toBeDefined();
  });
});
