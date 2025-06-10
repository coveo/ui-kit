import type {SearchEngine} from '@coveo/headless/ssr';
import {render, cleanup, screen} from '@testing-library/react';
import {Context, createContext} from 'react';
import React from 'react';
import {vi, expect, describe, test, afterEach} from 'vitest';
import {
  buildStateProvider,
  buildStaticStateProvider,
  buildHydratedStateProvider,
} from './common.js';
import {ContextState} from './types.js';

type MockContext = ContextState<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any
>;
describe('SSR Common functions', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockContext = createContext(
    null
  ) as unknown as Context<MockContext | null>;
  const mockSingletonContext = {
    get: () => mockContext,
  };

  const mockEngine = {
    state: {} as SearchEngine['state'],
    subscribe: vi.fn(),
    dispatch: vi.fn(),
  } as unknown as SearchEngine;

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

  function TestComponent() {
    return <div data-testid="test-component">Test</div>;
  }

  afterEach(() => {
    cleanup();
  });

  describe('buildStateProvider', () => {
    const StateProvider = buildStateProvider(mockSingletonContext);

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
      });
    });
  });

  describe('buildStaticStateProvider (deprecated)', () => {
    const StaticStateProvider = buildStaticStateProvider(mockSingletonContext);

    test('should render with static controllers', () => {
      render(
        <StaticStateProvider controllers={mockStaticControllers}>
          <TestComponent />
        </StaticStateProvider>
      );

      expect(screen.getByTestId('test-component')).toBeDefined();
    });

    test('should provide context value with controllers only', () => {
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

      expect(contextValue).toEqual({controllers: mockStaticControllers});
    });
  });

  describe('buildHydratedStateProvider (deprecated)', () => {
    const HydratedStateProvider =
      buildHydratedStateProvider(mockSingletonContext);

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

    test('should provide context value with engine and controllers', () => {
      let contextValue: unknown;
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
      });
    });
  });

  describe('StateProvider vs deprecated providers comparison', () => {
    const StateProvider = buildStateProvider(mockSingletonContext);
    const StaticStateProvider = buildStaticStateProvider(mockSingletonContext);
    const HydratedStateProvider =
      buildHydratedStateProvider(mockSingletonContext);

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
});
