import {
  buildCommerceEngine,
  type CommerceEngineConfiguration,
  getSampleCommerceEngineConfiguration,
  type ProductListing,
  type Search,
  type UrlManager,
} from '@coveo/headless/commerce';
import {html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {within} from 'shadow-dom-testing-library';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  type MockInstance,
  test,
  vi,
} from 'vitest';
import {bindings} from '@/src/decorators/bindings';
import type {InitializableComponent} from '@/src/decorators/types';
import {StorageItems} from '@/src/utils/local-storage-utils';
import {DEFAULT_MOBILE_BREAKPOINT} from '@/src/utils/replace-breakpoint';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {fixtureCleanup} from '@/vitest-utils/testing-helpers/fixture-wrapper';
import {stateKey} from '../../../../../headless/src/app/state-key';
import {
  AtomicCommerceInterface,
  type CommerceBindings,
} from './atomic-commerce-interface';

vi.mock('@coveo/headless/commerce', async () => {
  const originalModule = await vi.importActual('@coveo/headless/commerce');
  const state: {language: string; query?: string} = {language: 'en'};
  return {
    ...originalModule,
    buildContext: vi.fn(() => {
      const context = {
        state: {...state},
        setLanguage: (language: string) => {
          context.state.language = language;
        },
      };
      return context;
    }),

    buildProductListing: vi.fn(() => ({
      summary: vi.fn(() => ({
        subscribe: vi.fn(() => ({
          unsubscribe: vi.fn(),
        })),
      })),
      urlManager: vi.fn(() => ({
        subscribe: vi.fn(() => ({
          unsubscribe: vi.fn(),
        })),
      })),
      executeFirstRequest: vi.fn(),
    })),
    buildSearch: vi.fn(() => {
      const mockState = {firstRequestExecuted: true};
      const mockSubscribe = vi.fn((callback) => {
        return callback;
      });
      return {
        summary: vi.fn(() => ({subscribe: mockSubscribe, state: mockState})),
        urlManager: vi.fn(() => ({
          subscribe: vi.fn(() => ({unsubscribe: vi.fn()})),
        })),
        executeFirstSearch: vi.fn(),
      };
    }),
    loadQueryActions: vi.fn(() => ({
      updateQuery: vi.fn(({query}) => ({
        type: 'updateQuery',
        payload: {query},
      })),
    })),
    buildCommerceEngine: vi.fn(
      (config: {configuration: CommerceEngineConfiguration}) => {
        if (!config.configuration.organizationId) {
          throw new Error('Invalid configuration: organizationId is required');
        }
        return {
          [stateKey]: state,
          ...config,
          dispatch: vi.fn(),
          addReducers: vi.fn(),
          disableAnalytics: vi.fn(),
          enableAnalytics: vi.fn(),
          logger: {
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
          },
          subscribe: vi.fn(() => {
            return {
              unsubscribe: vi.fn(),
            };
          }),
        };
      }
    ),
  };
});

@customElement('test-element')
@bindings()
class TestElement
  extends LitElement
  implements InitializableComponent<CommerceBindings>
{
  @state()
  public bindings: CommerceBindings = {} as CommerceBindings;
  @state() public error!: Error;

  public initialized = false;

  public render() {
    return html`test-element`;
  }

  initialize = vi.fn();
}

const commerceEngineConfig: CommerceEngineConfiguration =
  getSampleCommerceEngineConfiguration();
describe.skip('AtomicCommerceInterface', () => {
  let element: AtomicCommerceInterface;
  let childElement: InitializableComponent<CommerceBindings> & TestElement;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  const addChildElement = async <T extends TestElement>(
    tag = 'test-element'
  ) => {
    childElement = document.createElement(
      tag
    ) as InitializableComponent<CommerceBindings> & T;
    element.appendChild(childElement);

    await childElement.updateComplete;
    expect(childElement).toBeInstanceOf(TestElement);
  };

  const setupElement = async () => {
    element = (await fixture<AtomicCommerceInterface>(
      html` <atomic-commerce-interface
        ><div>atomic-commerce-interface</div></atomic-commerce-interface
      >`
    )) as AtomicCommerceInterface;

    await element.updateComplete;
    expect(element).toBeInstanceOf(AtomicCommerceInterface);
  };

  const teardownElement = async () => {
    if (element) {
      element.remove();
    }
  };

  beforeEach(async () => {
    await teardownElement();
    fixtureCleanup();

    consoleErrorSpy?.mockRestore();
    await setupElement();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  test('should create the store', async () => {
    expect(element.store).toBeDefined();
    expect(element.store).toBeInstanceOf(Object);
  });

  test('should initialize engine with given options', async () => {
    await element.initialize(commerceEngineConfig);
    expect(element.engine).toBeTruthy();
    expect(element.engine?.configuration.organizationId).toBe(
      commerceEngineConfig.organizationId
    );
    expect(element.engine?.configuration.analytics.trackingId).toBe(
      commerceEngineConfig.analytics.trackingId
    );
  });

  test('should set error when initialization fails', async () => {
    const invalidConfig = {...commerceEngineConfig, organizationId: ''};
    await expect(element.initialize(invalidConfig)).rejects.toThrow();
    expect(element.error).toBeDefined();
  });

  describe('before being initialized', () => {
    test('when calling "executeFirstRequest", should log an error', async () => {
      const errorMessage =
        'You have to call "initialize" on the atomic-commerce-interface component before modifying the props or calling other public methods.';
      await element.executeFirstRequest();
      expect(consoleErrorSpy).toHaveBeenCalledWith(errorMessage, element);
    });

    test('when changing a property too early, should return error', async () => {
      const errorMessage =
        'You have to call "initialize" on the atomic-commerce-interface component before modifying the props or calling other public methods.';
      element.language = 'fr';
      await element.updateComplete;
      expect(consoleErrorSpy).toHaveBeenCalledWith(errorMessage, element);
    });
  });

  describe('when initialized with engine configuration', () => {
    beforeEach(async () => {
      await element.initialize(commerceEngineConfig);
      await addChildElement();

      await element.executeFirstRequest();
    });

    test('should render the component and its children', async () => {
      expect(element.shadowRoot).toBeTruthy();
      expect(within(element).queryByShadowText('test-element')).toBeTruthy();
    });

    test('should trigger the initialize method of the child component', async () => {
      expect(childElement.initialize).toHaveBeenCalledOnce();
    });

    test('should provide bindings to children', async () => {
      expect(childElement.bindings).toBeDefined();
      expect(childElement.bindings.engine).toBe(element.engine);
      expect(childElement.bindings.i18n).toBe(element.i18n);
      expect(childElement.bindings.store).toBe(element.store);
    });

    test('should set engine after initialization', async () => {
      await element.initialize(commerceEngineConfig);
      expect(element.engine).toBeTruthy();
    });

    test('should log a warning when scrollContainer is not found', async () => {
      const mockEngine = element.engine!;
      const warnSpy = vi.spyOn(mockEngine.logger, 'warn');
      element.scrollContainer = '.non-existent-container';
      element.scrollToTop();
      expect(warnSpy).toHaveBeenCalledWith(
        `Could not find the scroll container with the selector "${element.scrollContainer}". This will prevent UX interactions that require a scroll from working correctly. Please review the CSS selector in the scrollContainer option`
      );
    });

    describe('when properties changes', () => {
      test('should update language when language property changes', async () => {
        element.language = 'fr';
        await element.updateComplete;

        const context = element.context;
        expect(context.state.language).toBe('fr');
      });

      test('should update icon assets path when iconAssetsPath property changes', async () => {
        element.iconAssetsPath = '/new-assets';
        await element.updateComplete;
        expect(element.store.state.iconAssetsPath).toBe('/new-assets');
      });

      test('should update languageAssetsPath when property changes', async () => {
        element.languageAssetsPath = '/new-lang-assets';
        await element.updateComplete;
        expect(element.languageAssetsPath).toBe('/new-lang-assets');
      });

      test('should update scrollContainer when property changes', async () => {
        element.scrollContainer = '.new-scroll-container';
        await element.updateComplete;
        expect(element.scrollContainer).toBe('.new-scroll-container');
      });

      test('should update reflectStateInUrl when property changes', async () => {
        element.reflectStateInUrl = false;
        await element.updateComplete;
        expect(element.reflectStateInUrl).toBe(false);
      });

      test('should initialize i18n instance after initialization', async () => {
        await element.initialize(commerceEngineConfig);
        expect(element.i18n).toBeDefined();
        expect(element.i18n.isInitialized).toBeTruthy();
      });

      test('should update logLevel when property changes', async () => {
        element.logLevel = 'debug';
        await element.updateComplete;
        expect(element.logLevel).toBe('debug');
      });

      test('should update type when property changes', async () => {
        element.type = 'product-listing';
        await element.updateComplete;
        expect(element.type).toBe('product-listing');
      });

      test('should toggle analytics when property changes', async () => {
        const mockEngine = element.engine!;
        element.analytics = false;
        await element.updateComplete;
        expect(mockEngine.disableAnalytics).toHaveBeenCalled();

        element.analytics = true;
        await element.updateComplete;
        expect(mockEngine.enableAnalytics).toHaveBeenCalled();
      });
    });
  });

  describe('when initialized with existing engine', () => {
    let preconfiguredEngine: ReturnType<typeof buildCommerceEngine>;

    beforeEach(() => {
      preconfiguredEngine = buildCommerceEngine({
        configuration: getSampleCommerceEngineConfiguration(),
      });
    });

    test('should dispatch an updateAnalyticsConfiguration action with the correct source and trackingId', async () => {
      vi.spyOn(preconfiguredEngine, 'dispatch');

      expect(preconfiguredEngine.dispatch).not.toHaveBeenCalled();

      await element.initializeWithEngine(preconfiguredEngine);

      expect(preconfiguredEngine.dispatch).toHaveBeenCalledExactlyOnceWith({
        type: 'commerce/configuration/updateAnalyticsConfiguration',
        payload: {
          trackingId: preconfiguredEngine.configuration.analytics.trackingId,
          source: {'@coveo/atomic': '0.0.0'},
        },
      });
    });

    test('should render the component and its children', async () => {
      await addChildElement();
      await element.initializeWithEngine(preconfiguredEngine);
      expect(element.shadowRoot).toBeTruthy();
      expect(within(element).queryByShadowText('test-element')).toBeTruthy();
    });

    test('should initialize with a preconfigured engine', async () => {
      await element.initializeWithEngine(preconfiguredEngine);
      expect(element.engine).toBe(preconfiguredEngine);
    });

    test('should allow executing the first request after initialization', async () => {
      await element.initializeWithEngine(preconfiguredEngine);
      await element.executeFirstRequest();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  const interfaceType = [
    {type: 'product-listing', description: 'when type is product-listing'},
    {type: 'search', description: 'when type is search'},
  ];

  interfaceType.forEach(({type, description}) => {
    describe(description, () => {
      beforeEach(async () => {
        element.type = type as 'product-listing' | 'search';
        await element.updateComplete;
        await element.initialize(commerceEngineConfig);
      });

      test(`should initialize the ${type} engine`, async () => {
        expect(element.engine).toBeTruthy();
        expect(element.type).toBe(type);
      });

      test('should allow executing the first request after initialization', async () => {
        await element.executeFirstRequest();
        expect(consoleErrorSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('loading flag', () => {
    test('should set the loading flag during connectedCallback', async () => {
      const firstRequestExecutedFlag = 'firstRequestExecuted';
      expect(element.store.state.loadingFlags).toContain(
        firstRequestExecutedFlag
      );
    });

    test('should remove the loading flag on disconnect', async () => {
      const firstRequestExecutedFlag = 'firstRequestExecuted';

      await element.initialize(commerceEngineConfig);
      expect(element.engine).toBeTruthy();

      expect(element.store.state.loadingFlags).toContain(
        firstRequestExecutedFlag
      );

      element.disconnectedCallback();

      expect(element.store.state.loadingFlags).not.toContain(
        firstRequestExecutedFlag
      );
    });
  });

  describe('mobile breakpoint', () => {
    test('should keep the default mobile breakpoint when no atomic-commerce-layout element exists', () => {
      expect(element.store.state.mobileBreakpoint).toBe(
        DEFAULT_MOBILE_BREAKPOINT
      );
    });

    test('should keep the default mobile breakpoint when atomic-commerce-layout has no mobileBreakpoint', () => {
      const layoutElement = {};
      const originalQuerySelector = element.querySelector.bind(element);
      element.querySelector = vi.fn((selector: string) => {
        if (selector === 'atomic-commerce-layout') {
          return layoutElement as unknown as Element;
        }
        return originalQuerySelector(selector);
      });

      element.connectedCallback();

      expect(element.store.state.mobileBreakpoint).toBe(
        DEFAULT_MOBILE_BREAKPOINT
      );
    });

    test('should update mobile breakpoint from atomic-commerce-layout when available', () => {
      const layoutElement = {
        mobileBreakpoint: '768px',
      };
      const originalQuerySelector = element.querySelector.bind(element);
      element.querySelector = vi.fn((selector: string) => {
        if (selector === 'atomic-commerce-layout') {
          return layoutElement as unknown as Element;
        }
        return originalQuerySelector(selector);
      });

      element.connectedCallback();

      expect(element.store.state.mobileBreakpoint).toBe('768px');
    });
  });

  describe('aria-live', () => {
    test('should add aria-live if no atomic-aria-live element exists', async () => {
      await element.initialize(commerceEngineConfig);
      const ariaLiveElement = element.querySelector('atomic-aria-live');
      expect(ariaLiveElement).toBeTruthy();
    });

    test('should not add aria-live if an atomic-aria-live element already exists', async () => {
      element.connectedCallback();

      const ariaLiveElements = element.querySelectorAll('atomic-aria-live');
      expect(ariaLiveElements.length).toBe(1);
    });

    test('should remove aria-live on disconnect', async () => {
      await element.initialize(commerceEngineConfig);
      await element.updateComplete;
      element.disconnectedCallback();
      const ariaLiveElement = element?.querySelector('atomic-aria-live');
      expect(ariaLiveElement).toBeFalsy();
    });
  });

  describe('standalone search box', () => {
    const mockSafeStorage = {
      getItem: vi.fn() as MockInstance,
      removeItem: vi.fn() as MockInstance,
    };

    beforeEach(() => {
      mockSafeStorage.getItem = vi.spyOn(
        Storage.prototype,
        'getItem'
      ) as unknown as MockInstance;
      mockSafeStorage.removeItem = vi.spyOn(
        Storage.prototype,
        'removeItem'
      ) as unknown as MockInstance;
    });

    afterEach(() => {
      mockSafeStorage.getItem.mockRestore();
      mockSafeStorage.removeItem.mockRestore();
    });

    test('should update query and execute first search when StandaloneSearchBoxData exists', async () => {
      const standaloneSearchBoxData = {
        value: 'test query',
      };
      mockSafeStorage.getItem.mockReturnValue(
        JSON.stringify(standaloneSearchBoxData)
      );

      await element.initialize(commerceEngineConfig);
      await element.executeFirstRequest();

      expect(element.engine?.dispatch).toHaveBeenCalledWith({
        type: 'updateQuery',
        payload: {query: 'test query'},
      });
    });

    test('should execute first search without query update when StandaloneSearchBoxData does not exist', async () => {
      mockSafeStorage.getItem.mockReturnValue(null);

      await element.initialize(commerceEngineConfig);
      await element.executeFirstRequest();

      expect(element.engine?.dispatch).not.toHaveBeenCalledWith({
        type: 'updateQuery',
        payload: {query: undefined},
      });
    });

    test('should remove StandaloneSearchBoxData from local storage after use', async () => {
      const standaloneSearchBoxData = {
        value: 'test query',
      };
      mockSafeStorage.getItem.mockReturnValue(
        JSON.stringify(standaloneSearchBoxData)
      );

      await element.initialize(commerceEngineConfig);
      await element.executeFirstRequest();

      expect(mockSafeStorage.removeItem).toHaveBeenCalledWith(
        StorageItems.STANDALONE_SEARCH_BOX_DATA
      );
    });
  });

  describe('updateHash', () => {
    beforeEach(async () => {
      await element.initialize(commerceEngineConfig);
      element.urlManager = {
        state: {fragment: 'new-fragment'},
        subscribe: vi.fn(),
      } as unknown as UrlManager;
    });

    test('should replace state in history when not loading', async () => {
      element.searchOrListing = {
        state: {isLoading: false},
      } as unknown as Search | ProductListing;

      const replaceStateSpy = vi.spyOn(history, 'replaceState');
      // biome-ignore lint/suspicious/noExplicitAny: <>
      (element as any).updateHash();

      expect(replaceStateSpy).toHaveBeenCalledWith(
        null,
        document.title,
        '#new-fragment'
      );
    });

    test('should push state in history when loading', async () => {
      element.searchOrListing = {
        state: {isLoading: true},
      } as unknown as Search | ProductListing;

      const pushStateSpy = vi.spyOn(history, 'pushState');
      // biome-ignore lint/suspicious/noExplicitAny: <>
      (element as any).updateHash();

      expect(pushStateSpy).toHaveBeenCalledWith(
        null,
        document.title,
        '#new-fragment'
      );
    });
  });
});
