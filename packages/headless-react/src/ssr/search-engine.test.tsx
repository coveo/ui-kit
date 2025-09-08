import {
  getSampleSearchEngineConfiguration,
  type SearchEngine,
} from '@coveo/headless/ssr';
import {render, renderHook, screen} from '@testing-library/react';
import type {PropsWithChildren} from 'react';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from 'vitest';
import {
  createResultListComponent,
  createTestComponent,
} from '../__tests__/component-test-utils.js';
import {createMockNavigatorContextProvider} from '../__tests__/mock-navigator-context-provider.js';
import {
  buildMockController,
  defineMockSearchController,
} from '../__tests__/mock-ssr-controller-definitions.js';
import {createMockSearchEngine} from '../__tests__/mock-ssr-engine.js';
import {
  renderWithProvider,
  waitForAsyncUpdates,
} from '../__tests__/test-utils.js';
import {MissingEngineProviderError} from '../errors.js';
import {defineSearchEngine} from './search-engine.js';

type MockControllerDefinitions = {
  resultList: ReturnType<typeof defineMockSearchController>;
  searchBox: ReturnType<typeof defineMockSearchController>;
};

type MockControllers = {
  [K in keyof MockControllerDefinitions]: ReturnType<
    typeof buildMockController
  >;
};

describe('Search Engine', () => {
  let mockControllers: MockControllers;
  let mockNavigatorContextProvider: ReturnType<
    typeof createMockNavigatorContextProvider
  >;
  let engineDefinition: ReturnType<
    typeof defineSearchEngine<MockControllerDefinitions>
  >;
  let StateProvider: typeof engineDefinition.StateProvider;
  let errorSpy: MockInstance;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockNavigatorContextProvider = createMockNavigatorContextProvider();
    mockControllers = {
      resultList: buildMockController(),
      searchBox: buildMockController(),
    };

    engineDefinition = defineSearchEngine({
      configuration: {
        ...getSampleSearchEngineConfiguration(),
        analytics: {enabled: false}, // TODO: KIT-2585 Remove after analytics SSR support is added
      },
      navigatorContextProvider: mockNavigatorContextProvider,
      controllers: {
        resultList: defineMockSearchController(),
        searchBox: defineMockSearchController(),
      },
    });

    StateProvider = engineDefinition.StateProvider;
  });

  afterEach(async () => {
    errorSpy.mockClear();
    await waitForAsyncUpdates();
    vi.clearAllTimers();
    vi.clearAllMocks();
  });

  describe('Engine Definition', () => {
    it('should create engine definition with all required properties', () => {
      expect(engineDefinition).toHaveProperty('useEngine');
      expect(engineDefinition).toHaveProperty('controllers');
      expect(engineDefinition).toHaveProperty('fetchStaticState');
      expect(engineDefinition).toHaveProperty('hydrateStaticState');
      expect(engineDefinition).toHaveProperty('build');
      expect(engineDefinition).toHaveProperty('StaticStateProvider');
      expect(engineDefinition).toHaveProperty('HydratedStateProvider');
      expect(engineDefinition).toHaveProperty('StateProvider');
      expect(engineDefinition).toHaveProperty('setNavigatorContextProvider');
    });

    it('should create controller hooks for each controller in definition', () => {
      const {
        controllers: {useResultList, useSearchBox, ...rest},
      } = engineDefinition;

      expect(typeof useResultList).toBe('function');
      expect(typeof useSearchBox).toBe('function');
      expect(rest).toEqual({});
    });
  });

  describe('Hook Behavior', () => {
    let useEngine: typeof engineDefinition.useEngine;
    let controllers: typeof engineDefinition.controllers;
    const staticProviderWrapper = ({children}: PropsWithChildren) => (
      <StateProvider controllers={mockControllers}>{children}</StateProvider>
    );
    const hydratedProviderWrapper =
      (engine: SearchEngine) =>
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
          renderHook(() => controllers.useResultList());
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
        const hookResult = renderHook(() => controllers.useResultList(), {
          wrapper: staticProviderWrapper,
        });

        expect(hookResult.result.current).toHaveProperty('state');
        expect(hookResult.result.current).toHaveProperty('methods', undefined);
      });
    });

    describe('Hydrated State Behavior', () => {
      it('useEngine should return engine instance in hydrated state', async () => {
        const hookResult = renderHook(() => useEngine(), {
          wrapper: hydratedProviderWrapper(createMockSearchEngine()),
        });

        expect(hookResult.result.current).toBeDefined();
      });

      it('controller hooks should have state and methods in hydrated state', async () => {
        const hookResult = renderHook(() => controllers.useResultList(), {
          wrapper: hydratedProviderWrapper(createMockSearchEngine()),
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
      const {ResultListComponent} = createResultListComponent(5);

      renderWithProvider(<ResultListComponent />, {provider: StateProvider});

      expect(screen.getByTestId('result-list')).toBeDefined();
      expect(screen.getAllByTestId('result-item')).toHaveLength(5);
    });

    it('should render components with hydrated state', async () => {
      const {ResultListComponent} = createResultListComponent(5);

      renderWithProvider(<ResultListComponent />, {
        provider: StateProvider,
        engine: createMockSearchEngine(),
      });

      expect(screen.getByTestId('result-list')).toBeDefined();
      expect(screen.getAllByTestId('result-item')).toHaveLength(5);
    });
  });
});
