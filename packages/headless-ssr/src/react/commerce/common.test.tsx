import {
  type CommerceHydratedState,
  type CommerceStaticState,
  type Controller,
  type ControllerDefinitionsMap,
  SolutionType,
  type CommerceEngine as SSRCommerceEngine,
} from '../../commerce.index.js';
import {act, cleanup, render, screen} from '@testing-library/react';
import React, {type Context, createContext} from 'react';
import {afterEach, describe, expect, test, vi} from 'vitest';
import {buildControllerHooks, buildStateProvider} from './common.js';
import type {ContextState, StateProviderProps} from './types.js';

type MockDefinitions = ControllerDefinitionsMap<Controller>;
type MockContext = ContextState<MockDefinitions, SolutionType.listing>;
type MockControllers = StateProviderProps<
  CommerceStaticState<MockDefinitions, SolutionType.listing>,
  CommerceHydratedState<MockDefinitions, SolutionType.listing>
>['controllers'];
describe('SSR Commerce Common functions', () => {
  const mockContext = createContext(null) as unknown as Context<MockContext | null>;
  const mockSingletonContext = {
    get: () => mockContext,
  };

  const mockEngine = {
    subscribe: vi.fn(),
    dispatch: vi.fn(),
  } as unknown as SSRCommerceEngine;

  const mockControllers = {
    searchBox: {
      state: {value: 'test'},
      subscribe: vi.fn(),
      methods: {updateText: vi.fn()},
    },
  } as unknown as MockControllers;

  const mockStaticControllers = {
    searchBox: {
      state: {value: 'test'},
    },
  } as unknown as MockControllers;

  const mockSolutionType = SolutionType.listing;

  function TestComponent() {
    return <div data-testid="test-component">Test</div>;
  }

  afterEach(() => {
    cleanup();
  });

  describe('buildStateProvider', () => {
    const StateProvider = buildStateProvider(mockSingletonContext, mockSolutionType);

    test('should render with static controllers only', () => {
      render(
        <StateProvider controllers={mockStaticControllers}>
          <TestComponent />
        </StateProvider>
      );

      expect(screen.getByTestId('test-component')).toBeDefined();
    });

    test('should render with both engine and controllers', () => {
      render(
        <StateProvider engine={mockEngine} controllers={mockControllers}>
          <TestComponent />
        </StateProvider>
      );

      expect(screen.getByTestId('test-component')).toBeDefined();
    });

    test('should provide context value with engine when provided', () => {
      let contextValue: MockContext | null = null;
      const TestConsumer = () => {
        const ctx = React.useContext(mockContext);
        contextValue = ctx;
        return <div />;
      };

      render(
        <StateProvider engine={mockEngine} controllers={mockControllers}>
          <TestConsumer />
        </StateProvider>
      );

      expect(contextValue).toEqual({
        engine: mockEngine,
        controllers: mockControllers,
        solutionType: mockSolutionType,
      });
    });

    test('should provide context value without engine when not provided', () => {
      let contextValue: MockContext | null = null;
      const TestConsumer = () => {
        const ctx = React.useContext(mockContext);
        contextValue = ctx;
        return <div />;
      };

      render(
        <StateProvider controllers={mockStaticControllers}>
          <TestConsumer />
        </StateProvider>
      );

      expect(contextValue).toEqual({
        engine: undefined,
        controllers: mockStaticControllers,
        solutionType: mockSolutionType,
      });
    });
  });

  describe('isomorphic behavior', () => {
    const StateProvider = buildStateProvider(mockSingletonContext, mockSolutionType);

    test('should work seamlessly when transitioning from static to hydrated state', () => {
      const contextValues: (MockContext | null)[] = [];

      const TestConsumer = () => {
        const ctx = React.useContext(mockContext);
        contextValues.push(ctx);
        return <div />;
      };

      // First render with static state
      const {rerender} = render(
        <StateProvider controllers={mockStaticControllers}>
          <TestConsumer />
        </StateProvider>
      );

      // Re-render with hydrated state (simulating hydration)
      rerender(
        <StateProvider engine={mockEngine} controllers={mockControllers}>
          <TestConsumer />
        </StateProvider>
      );

      expect(contextValues).toHaveLength(2);

      // First render should have no engine
      expect(contextValues[0]).toEqual({
        engine: undefined,
        controllers: mockStaticControllers,
        solutionType: mockSolutionType,
      });

      // Second render should have engine
      expect(contextValues[1]).toEqual({
        engine: mockEngine,
        controllers: mockControllers,
        solutionType: mockSolutionType,
      });
    });
  });

  describe('buildControllerHooks', () => {
    const definitions = {
      searchBox: {build: vi.fn(), listing: true, search: true, standalone: true},
    } as unknown as MockDefinitions;
    const {useSearchBox} = buildControllerHooks(mockSingletonContext, definitions) as unknown as {
      useSearchBox: () => {state: {value: string}; methods?: {updateText: () => unknown}};
    };
    const StateProvider = buildStateProvider(mockSingletonContext, mockSolutionType);
    let latestMethods: {updateText: () => unknown} | undefined;

    function SearchBoxValue() {
      const {state, methods} = useSearchBox();
      latestMethods = methods;
      return <div data-testid="search-box-value">{state.value}</div>;
    }

    function buildLiveSearchBox() {
      let state = {value: 'live'};
      const listeners = new Set<() => void>();
      const controller = {
        get state() {
          return state;
        },
        subscribe: vi.fn((listener: () => void) => {
          listeners.add(listener);
          return () => listeners.delete(listener);
        }),
        updateText: vi.fn(function (this: unknown) {
          return this;
        }),
      };
      const setState = (next: {value: string}) => {
        state = next;
        listeners.forEach((listener) => listener());
      };
      return {controller, setState};
    }

    test('should read the static state and expose no methods before hydration', () => {
      render(
        <StateProvider controllers={mockStaticControllers}>
          <SearchBoxValue />
        </StateProvider>
      );

      expect(screen.getByTestId('search-box-value').textContent).toBe('test');
      expect(latestMethods).toBeUndefined();
    });

    test('should subscribe to the live controller and bind its methods once hydrated', () => {
      const {controller} = buildLiveSearchBox();
      render(
        <StateProvider
          engine={mockEngine}
          controllers={{searchBox: controller} as unknown as MockControllers}
        >
          <SearchBoxValue />
        </StateProvider>
      );

      expect(screen.getByTestId('search-box-value').textContent).toBe('live');
      expect(controller.subscribe).toHaveBeenCalledTimes(1);
      expect(latestMethods?.updateText()).toBe(controller);
    });

    test('should re-render when the live controller notifies a change', () => {
      const {controller, setState} = buildLiveSearchBox();
      render(
        <StateProvider
          engine={mockEngine}
          controllers={{searchBox: controller} as unknown as MockControllers}
        >
          <SearchBoxValue />
        </StateProvider>
      );

      act(() => setState({value: 'changed'}));

      expect(screen.getByTestId('search-box-value').textContent).toBe('changed');
    });

    test('should not subscribe again when the parent of the provider re-renders', () => {
      const {controller} = buildLiveSearchBox();
      const controllers = {searchBox: controller} as unknown as MockControllers;
      const tree = () => (
        <StateProvider engine={mockEngine} controllers={controllers}>
          <SearchBoxValue />
        </StateProvider>
      );
      const {rerender} = render(tree());
      const firstMethods = latestMethods;

      rerender(tree());

      expect(controller.subscribe).toHaveBeenCalledTimes(1);
      expect(latestMethods).toBe(firstMethods);
    });
  });
});
