import type {
  CommerceEngine,
  ContextOptions,
} from '@coveo/headless/ssr-commerce';
import {render, renderHook, screen} from '@testing-library/react';
import type {PropsWithChildren} from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {
  createProductListComponent,
  createTestComponent,
} from '../__tests__/component-test-utils.js';
import {createMockNavigatorContextProvider} from '../__tests__/mock-navigator-context-provider.js';
import {
  buildMockController,
  defineMockCommerceController,
} from '../__tests__/mock-ssr-controller-definitions.js';
import {createMockCommerceEngine} from '../__tests__/mock-ssr-engine.js';
import {
  renderWithProvider,
  waitForAsyncUpdates,
} from '../__tests__/test-utils.js';
import {MissingEngineProviderError} from '../errors.js';
import {defineCommerceEngine} from './commerce-engine.js';

type MockControllerDefinitions = {
  controller1: ReturnType<typeof defineMockCommerceController>;
  controller2: ReturnType<typeof defineMockCommerceController>;
};

type MockControllers = {
  [K in keyof MockControllerDefinitions]: ReturnType<
    typeof buildMockController
  >;
};

describe('Commerce Engine', () => {
  let mockControllers: MockControllers;
  let mockNavigatorContextProvider: ReturnType<
    typeof createMockNavigatorContextProvider
  >;
  let engineDefinition: ReturnType<
    typeof defineCommerceEngine<MockControllerDefinitions>
  >;
  let StateProvider: typeof engineDefinition.listingEngineDefinition.StateProvider;

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mockNavigatorContextProvider = createMockNavigatorContextProvider();
    mockControllers = {
      controller1: buildMockController(),
      controller2: buildMockController(),
    };

    engineDefinition = defineCommerceEngine({
      configuration: {
        organizationId: 'some-org-id',
        accessToken: 'some-token',
        analytics: {
          trackingId: 'xxx',
        },
        context: {
          country: 'US',
          language: 'en',
          view: {url: 'https://example.com'},
          currency: 'USD',
        } as ContextOptions,
      },
      navigatorContextProvider: mockNavigatorContextProvider,
      controllers: {
        controller1: defineMockCommerceController(),
        controller2: defineMockCommerceController(),
      },
    });

    StateProvider = engineDefinition.listingEngineDefinition.StateProvider;
  });

  afterEach(async () => {
    await waitForAsyncUpdates();
  });

  describe('Engine Definition', () => {
    it('should create engine definition with all required properties', () => {
      expect(engineDefinition).toHaveProperty('useEngine');
      expect(engineDefinition).toHaveProperty('controllers');
      expect(engineDefinition).toHaveProperty('listingEngineDefinition');
      expect(engineDefinition).toHaveProperty('searchEngineDefinition');
      expect(engineDefinition).toHaveProperty('standaloneEngineDefinition');
      expect(engineDefinition).toHaveProperty('recommendationEngineDefinition');
    });

    it('should create controller hooks for each controller in definition', () => {
      const {
        controllers: {useController1, useController2, ...rest},
      } = engineDefinition;

      expect(typeof useController1).toBe('function');
      expect(typeof useController2).toBe('function');
      expect(rest).toEqual({});
    });

    it('should provide different providers for each solution type', () => {
      const definitions = [
        'listingEngineDefinition',
        'searchEngineDefinition',
        'recommendationEngineDefinition',
        'standaloneEngineDefinition',
      ] as const;

      for (const def of definitions) {
        expect(engineDefinition[def]).toHaveProperty('StaticStateProvider');
        expect(engineDefinition[def]).toHaveProperty('HydratedStateProvider');
        expect(engineDefinition[def]).toHaveProperty('StateProvider');
      }
    });
  });

  describe('Hook Behavior', () => {
    let useEngine: typeof engineDefinition.useEngine;
    let controllers: typeof engineDefinition.controllers;
    const staticProviderWrapper = ({children}: PropsWithChildren) => (
      <StateProvider controllers={mockControllers}>{children}</StateProvider>
    );
    const hydratedProviderWrapper =
      (engine: CommerceEngine) =>
      ({children}: PropsWithChildren) => (
        <StateProvider controllers={mockControllers} engine={engine}>
          {children}
        </StateProvider>
      );

    beforeEach(() => {
      useEngine = engineDefinition.useEngine;
      controllers = engineDefinition.controllers;
    });

    describe('Error Handling', () => {
      it('should throw error when useEngine is called outside provider', () => {
        expect(() => {
          renderHook(() => useEngine());
        }).toThrow(MissingEngineProviderError);
      });

      it('should throw error when controller hooks are called outside provider', () => {
        expect(() => {
          renderHook(() => controllers.useController1());
        }).toThrow(MissingEngineProviderError);
      });
    });

    describe('Static State Behavior', () => {
      it('useEngine should return undefined in static state', async () => {
        const hookResult = renderHook(() => useEngine(), {
          wrapper: staticProviderWrapper,
        });

        expect(hookResult.result.current).toBeUndefined();
      });

      it('controller hooks should have state but no methods in static state', async () => {
        const hookResult = renderHook(() => controllers.useController1(), {
          wrapper: staticProviderWrapper,
        });

        expect(hookResult.result.current).toHaveProperty('state');
        expect(hookResult.result.current).toHaveProperty('methods', undefined);
      });
    });

    describe('Hydrated State Behavior', () => {
      it('useEngine should return engine instance in hydrated state', async () => {
        const hookResult = renderHook(() => useEngine(), {
          wrapper: hydratedProviderWrapper(createMockCommerceEngine()),
        });

        expect(hookResult.result.current).toBeDefined();
        expect(hookResult.result.current).toBeDefined();
      });

      it('controller hooks should have state and methods in hydrated state', async () => {
        const hookResult = renderHook(() => controllers.useController1(), {
          wrapper: hydratedProviderWrapper(createMockCommerceEngine()),
        });

        expect(hookResult.result.current).toHaveProperty('state');
        expect(hookResult.result.current).toHaveProperty('methods');
      });
    });
  });

  describe('Component Rendering', () => {
    it('should throw error when component uses hooks without provider context', () => {
      const TestComponent = createTestComponent('test-component');
      expect(
        () => render(<TestComponent />),
        MissingEngineProviderError.message
      );
    });

    it('should render components with static state', async () => {
      const {ProductListComponent} = createProductListComponent(5);

      renderWithProvider(<ProductListComponent />, {provider: StateProvider});

      expect(screen.getByTestId('product-list')).toBeDefined();
      expect(screen.getAllByTestId('product-item')).toHaveLength(5);
    });

    it('should render components with hydrated state', async () => {
      const {ProductListComponent} = createProductListComponent(5);

      renderWithProvider(<ProductListComponent />, {
        provider: StateProvider,
        engine: createMockCommerceEngine(),
      });

      expect(screen.getByTestId('product-list')).toBeDefined();
      expect(screen.getAllByTestId('product-item')).toHaveLength(5);
    });
  });
});
