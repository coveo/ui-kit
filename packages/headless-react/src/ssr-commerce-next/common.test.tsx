/** biome-ignore-all lint/suspicious/noExplicitAny: <> */
import {
  SolutionType,
  type CommerceEngine as SSRCommerceEngine,
} from '@coveo/headless/ssr-commerce-next';
import {cleanup, render, screen} from '@testing-library/react';
import React, {type Context, createContext} from 'react';
import {afterEach, describe, expect, test, vi} from 'vitest';
import {buildStateProvider} from './common.js';
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
