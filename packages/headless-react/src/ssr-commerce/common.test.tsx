/** biome-ignore-all lint/suspicious/noExplicitAny: <> */
import {
  SolutionType,
  type CommerceEngine as SSRCommerceEngine,
} from '@coveo/headless/ssr-commerce';
import {cleanup, render, screen} from '@testing-library/react';
import React, {type Context, createContext} from 'react';
import {afterEach, describe, expect, test, vi} from 'vitest';
import {
  buildHydratedStateProvider,
  buildStateProvider,
  buildStaticStateProvider,
} from './common.js';
import type {ContextState} from './types.js';

type MockContext = ContextState<any, any>;
describe('SSR Commerce Common functions', () => {
  const mockContext = createContext(
    null
  ) as unknown as Context<MockContext | null>;
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
  };

  const mockStaticControllers = {
    searchBox: {
      state: {value: 'test'},
    },
  };

  const mockSolutionType = SolutionType.listing;

  function TestComponent() {
    return <div data-testid="test-component">Test</div>;
  }

  afterEach(() => {
    cleanup();
  });

  describe('buildStateProvider', () => {
    const StateProvider = buildStateProvider(
      mockSingletonContext,
      mockSolutionType
    );

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

  describe('buildStaticStateProvider (deprecated)', () => {
    const StaticStateProvider = buildStaticStateProvider(
      mockSingletonContext,
      mockSolutionType
    );

    test('should render with static controllers', () => {
      render(
        <StaticStateProvider controllers={mockStaticControllers}>
          <TestComponent />
        </StaticStateProvider>
      );

      expect(screen.getByTestId('test-component')).toBeDefined();
    });

    test('should provide context value with controllers and solutionType', () => {
      let contextValue: MockContext | null = null;
      const TestConsumer = () => {
        const ctx = React.useContext(mockContext);
        contextValue = ctx;
        return <div />;
      };

      render(
        <StaticStateProvider controllers={mockStaticControllers}>
          <TestConsumer />
        </StaticStateProvider>
      );

      expect(contextValue).toEqual({
        controllers: mockStaticControllers,
        solutionType: mockSolutionType,
      });
    });
  });

  describe('buildHydratedStateProvider (deprecated)', () => {
    const HydratedStateProvider = buildHydratedStateProvider(
      mockSingletonContext,
      mockSolutionType
    );

    test('should render with engine and controllers', () => {
      render(
        <HydratedStateProvider
          engine={mockEngine}
          controllers={mockControllers}
        >
          <TestComponent />
        </HydratedStateProvider>
      );

      expect(screen.getByTestId('test-component')).toBeDefined();
    });

    test('should provide context value with engine, controllers, and solutionType', () => {
      let contextValue: MockContext | null = null;
      const TestConsumer = () => {
        const ctx = React.useContext(mockContext);
        contextValue = ctx;
        return <div />;
      };

      render(
        <HydratedStateProvider
          engine={mockEngine}
          controllers={mockControllers}
        >
          <TestConsumer />
        </HydratedStateProvider>
      );

      expect(contextValue).toEqual({
        engine: mockEngine,
        controllers: mockControllers,
        solutionType: mockSolutionType,
      });
    });
  });

  describe('StateProvider vs deprecated providers comparison', () => {
    const StateProvider = buildStateProvider(
      mockSingletonContext,
      mockSolutionType
    );
    const StaticStateProvider = buildStaticStateProvider(
      mockSingletonContext,
      mockSolutionType
    );
    const HydratedStateProvider = buildHydratedStateProvider(
      mockSingletonContext,
      mockSolutionType
    );

    test('StateProvider with static controllers should behave like StaticStateProvider', () => {
      let stateProviderValue: MockContext | null = null;
      let staticProviderValue: MockContext | null = null;

      const StateConsumer = () => {
        const ctx = React.useContext(mockContext);
        stateProviderValue = ctx;
        return <div />;
      };

      const StaticConsumer = () => {
        const ctx = React.useContext(mockContext);
        staticProviderValue = ctx;
        return <div />;
      };

      render(
        <StateProvider controllers={mockStaticControllers}>
          <StateConsumer />
        </StateProvider>
      );

      render(
        <StaticStateProvider controllers={mockStaticControllers}>
          <StaticConsumer />
        </StaticStateProvider>
      );

      // StateProvider should include engine: undefined, while StaticStateProvider doesn't include engine at all
      expect(stateProviderValue!.controllers).toEqual(
        staticProviderValue!.controllers
      );
      expect(stateProviderValue!.solutionType).toEqual(
        staticProviderValue!.solutionType
      );
      expect(stateProviderValue!.engine).toBeUndefined();
      expect('engine' in staticProviderValue!).toBe(false);
    });

    test('StateProvider with hydrated state should behave like HydratedStateProvider', () => {
      let stateProviderValue: MockContext | null = null;
      let hydratedProviderValue: MockContext | null = null;

      const StateConsumer = () => {
        const ctx = React.useContext(mockContext);
        stateProviderValue = ctx;
        return <div />;
      };

      const HydratedConsumer = () => {
        const ctx = React.useContext(mockContext);
        hydratedProviderValue = ctx;
        return <div />;
      };

      render(
        <StateProvider engine={mockEngine} controllers={mockControllers}>
          <StateConsumer />
        </StateProvider>
      );

      render(
        <HydratedStateProvider
          engine={mockEngine}
          controllers={mockControllers}
        >
          <HydratedConsumer />
        </HydratedStateProvider>
      );

      expect(stateProviderValue).toEqual(hydratedProviderValue);
    });
  });

  describe('isomorphic behavior', () => {
    const StateProvider = buildStateProvider(
      mockSingletonContext,
      mockSolutionType
    );

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
});
