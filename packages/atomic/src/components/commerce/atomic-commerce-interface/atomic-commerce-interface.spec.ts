import {
  buildCommerceEngine,
  buildContext,
  buildProductListing,
  buildSearch,
  type CommerceEngineConfiguration,
  getSampleCommerceEngineConfiguration,
  loadConfigurationActions,
  loadQueryActions,
  type ProductListingSummaryState,
  type SearchSummaryState,
} from '@coveo/headless/commerce';
import './atomic-commerce-interface.js';
import {html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {within} from 'shadow-dom-testing-library';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {bindings} from '@/src/decorators/bindings';
import type {InitializableComponent} from '@/src/decorators/types';
import {StorageItems} from '@/src/utils/local-storage-utils';
import {DEFAULT_MOBILE_BREAKPOINT} from '@/src/utils/replace-breakpoint';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {buildFakeContext} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/context-controller';
import {buildFakeCommerceEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/engine';
import {buildFakeProductListing} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product-listing-controller';
import {buildFakeSearch} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/search-controller';
import {buildFakeSummary} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/summary-subcontroller';
import {
  AtomicCommerceInterface,
  type CommerceBindings,
} from './atomic-commerce-interface';

vi.mock('@coveo/headless/commerce', {spy: true});

@customElement('test-element')
@bindings()
class TestElement
  extends LitElement
  implements InitializableComponent<CommerceBindings>
{
  @state()
  public bindings: CommerceBindings = {} as CommerceBindings;
  @state() public error!: Error;

  public initialize = vi.fn();

  public render() {
    return html`test-element`;
  }
}

describe('atomic-commerce-interface', () => {
  const commerceEngineConfig: CommerceEngineConfiguration =
    getSampleCommerceEngineConfiguration();

  let mockProductListingSummary: ReturnType<
    typeof buildFakeSummary<ProductListingSummaryState>
  >;
  let mockSearchSummary: ReturnType<
    typeof buildFakeSummary<SearchSummaryState>
  >;

  const setupElement = async (
    props: {
      type?: 'search' | 'product-listing';
      analytics?: boolean;
      language?: string;
      iconAssetsPath?: string;
      languageAssetsPath?: string;
      scrollContainer?: string;
      reflectStateInUrl?: boolean;
      disableStateReflectionInUrl?: boolean;
    } = {}
  ) => {
    const element = (await fixture<AtomicCommerceInterface>(
      html`<atomic-commerce-interface
        .type=${props.type || 'search'}
        .analytics=${props.analytics ?? true}
        .language=${props.language}
        .iconAssetsPath=${props.iconAssetsPath || './assets'}
        .languageAssetsPath=${props.languageAssetsPath || './lang'}
        .scrollContainer=${props.scrollContainer || 'atomic-commerce-interface'}
        .reflectStateInUrl=${props.reflectStateInUrl ?? true}
        .disableStateReflectionInUrl=${props.disableStateReflectionInUrl ?? false}
        ><div>Interface content</div></atomic-commerce-interface
      >`
    )) as AtomicCommerceInterface;

    await element.updateComplete;
    expect(element).toBeInstanceOf(AtomicCommerceInterface);
    return element;
  };

  const addChildElement = async (
    element: AtomicCommerceInterface,
    tag = 'test-element'
  ) => {
    const childElement = document.createElement(
      tag
    ) as InitializableComponent<CommerceBindings> & TestElement;
    element.appendChild(childElement);

    await childElement.updateComplete;
    expect(childElement).toBeInstanceOf(TestElement);
    return childElement;
  };

  beforeEach(() => {
    mockProductListingSummary = buildFakeSummary({
      state: {
        firstRequestExecuted: false,
        hasProducts: true,
        hasError: false,
        firstProduct: 1,
        lastProduct: 10,
        totalNumberOfProducts: 100,
        isLoading: false,
      },
    });

    mockSearchSummary = buildFakeSummary({
      state: {
        firstRequestExecuted: false,
        hasProducts: true,
        hasError: false,
        query: '',
        firstProduct: 1,
        lastProduct: 10,
        totalNumberOfProducts: 100,
        isLoading: false,
      },
    });

    vi.mocked(buildCommerceEngine).mockReturnValue(buildFakeCommerceEngine({}));
    vi.mocked(buildContext).mockReturnValue(buildFakeContext({}));
    vi.mocked(buildProductListing).mockReturnValue(
      buildFakeProductListing({
        implementation: {
          summary: () => mockProductListingSummary,
          urlManager: () => ({
            state: {fragment: ''},
            subscribe: vi.fn(() => vi.fn()),
            synchronize: vi.fn(),
          }),
          executeFirstRequest: vi.fn(),
        },
      })
    );
    vi.mocked(buildSearch).mockReturnValue(
      buildFakeSearch({
        implementation: {
          summary: () => mockSearchSummary,
          urlManager: () => ({
            state: {fragment: ''},
            subscribe: vi.fn(() => vi.fn()),
            synchronize: vi.fn(),
          }),
          executeFirstSearch: vi.fn(),
        },
      })
    );
    vi.mocked(loadConfigurationActions).mockReturnValue({
      updateAnalyticsConfiguration: vi.fn(),
      disableAnalytics: vi.fn(),
      enableAnalytics: vi.fn(),
      updateBasicConfiguration: vi.fn(),
      updateProxyBaseUrl: vi.fn(),
    });
    vi.mocked(loadQueryActions).mockReturnValue({
      updateQuery: vi.fn(),
    });
  });

  // #constructor
  describe('when created', () => {
    it('should create the i18n instance', async () => {
      const element = await setupElement();

      expect(element.i18n).toBeDefined();
    });
  });

  // #connectedCallback
  describe('when added to the DOM', () => {
    it('should update mobile breakpoint from atomic-commerce-layout when available', async () => {
      const element = await setupElement();
      await element.initialize(commerceEngineConfig);

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

      expect(element.bindings.store.state.mobileBreakpoint).toBe('768px');
    });

    it('should keep default mobile breakpoint when no atomic-commerce-layout exists', async () => {
      const element = await setupElement();
      await element.initialize(commerceEngineConfig);

      expect(element.bindings.store.state.mobileBreakpoint).toBe(
        DEFAULT_MOBILE_BREAKPOINT
      );
    });

    it('should handle initializeComponent events', async () => {
      const element = await setupElement();

      const event = new CustomEvent('atomic/initializeComponent');
      element.dispatchEvent(event);

      expect(expect.any(Function)).toHaveBeenCalledWith({behavior: 'smooth'});
    });

    it('should handle scroll to top events', async () => {
      const element = await setupElement();
      const scrollIntoViewSpy = vi
        .spyOn(element, 'scrollIntoView')
        .mockImplementation(() => {});

      const event = new CustomEvent('atomic/scrollToTop');
      element.dispatchEvent(event);

      expect(scrollIntoViewSpy).toHaveBeenCalledWith({behavior: 'smooth'});
    });

    it('should warn when scroll container is not found', async () => {
      const element = await setupElement({scrollContainer: '.non-existent'});
      const mockEngine = buildFakeCommerceEngine({});
      await element.initializeWithEngine(mockEngine);

      const event = new CustomEvent('atomic/scrollToTop');
      element.dispatchEvent(event);

      expect(mockEngine.logger.warn).toHaveBeenCalledWith(
        'Could not find the scroll container with the selector ".non-existent". This will prevent UX interactions that require a scroll from working correctly. Please review the CSS selector in the scrollContainer option'
      );
    });
  });

  describe('#initialize', () => {
    it('should initialize engine with given options', async () => {
      const element = await setupElement();
      await element.initialize(commerceEngineConfig);

      expect(element.engine).toBeTruthy();
      expect(element.engine?.configuration.organizationId).toBe(
        commerceEngineConfig.organizationId
      );
      expect(element.engine?.configuration.analytics.trackingId).toBe(
        commerceEngineConfig.analytics.trackingId
      );
    });

    it('should set error when initialization fails', async () => {
      const element = await setupElement();
      const invalidConfig = {...commerceEngineConfig, organizationId: ''};

      vi.mocked(buildCommerceEngine).mockImplementation(() => {
        throw new Error('Invalid configuration: organizationId is required');
      });

      await expect(element.initialize(invalidConfig)).rejects.toThrow();
      expect(element.error).toBeDefined();
    });
  });

  describe('#initializeWithEngine', () => {
    it('should dispatch an updateAnalyticsConfiguration action with the correct source and trackingId', async () => {
      const element = await setupElement();
      const engine = buildFakeCommerceEngine({});
      const updateAnalyticsConfigurationMock = vi.fn();

      vi.mocked(loadConfigurationActions).mockReturnValue({
        updateAnalyticsConfiguration: updateAnalyticsConfigurationMock,
      } as never);

      await element.initializeWithEngine(engine);

      expect(updateAnalyticsConfigurationMock).toHaveBeenCalledWith({
        trackingId: engine.configuration.analytics.trackingId,
        source: {'@coveo/atomic': '0.0.0'},
      });
    });

    it('should initialize with a preconfigured engine', async () => {
      const element = await setupElement();
      const engine = buildFakeCommerceEngine({});

      await element.initializeWithEngine(engine);
      expect(element.engine).toBe(engine);
    });

    it('should set bindings to the expected values', async () => {
      const element = await setupElement();
      const engine = buildFakeCommerceEngine({});

      await element.initializeWithEngine(engine);

      expect(element.bindings.engine).toBe(engine);
      expect(element.bindings.i18n).toBe(element.i18n);
      expect(element.bindings.store).toBe(element.bindings.store);
      expect(element.bindings.interfaceElement).toBe(element);
    });

    it('should provide bindings to children', async () => {
      const element = await setupElement();
      const childElement = await addChildElement(element);
      const engine = buildFakeCommerceEngine({});

      await element.initializeWithEngine(engine);

      expect(childElement.bindings).toBe(element.bindings);
      expect(childElement.bindings.engine).toBe(engine);
    });

    it('should trigger the initialize method of the child component', async () => {
      const element = await setupElement();
      const childElement = await addChildElement(element);
      const engine = buildFakeCommerceEngine({});

      await element.initializeWithEngine(engine);

      expect(childElement.initialize).toHaveBeenCalledOnce();
    });
  });

  // #executeFirstRequest
  describe('#executeFirstRequest', () => {
    it('should log an error when called before initialization', async () => {
      const element = await setupElement();
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      await element.executeFirstRequest();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'You have to call "initialize" on the atomic-commerce-interface component before modifying the props or calling other public methods.',
        element
      );
    });

    describe('when initialized with search interface', () => {
      it('should call executeFirstSearch', async () => {
        const element = await setupElement({type: 'search'});
        const mockSearch = buildFakeSearch({
          implementation: {
            summary: () => mockSearchSummary,
            urlManager: () => ({
              state: {fragment: ''},
              subscribe: vi.fn(() => vi.fn()),
              synchronize: vi.fn(),
            }),
            executeFirstSearch: vi.fn(),
          },
        });
        vi.mocked(buildSearch).mockReturnValue(mockSearch);

        await element.initialize(commerceEngineConfig);
        await element.executeFirstRequest();

        expect(mockSearch.executeFirstSearch).toHaveBeenCalled();
      });

      it('should update query and execute search when standalone search box data exists', async () => {
        const element = await setupElement({type: 'search'});
        const mockEngine = buildFakeCommerceEngine({});
        const mockUpdateQuery = vi.fn().mockReturnValue({
          type: 'updateQuery',
          payload: {query: 'test query'},
        });

        vi.mocked(buildCommerceEngine).mockReturnValue(mockEngine);
        vi.mocked(loadQueryActions).mockReturnValue({
          updateQuery: mockUpdateQuery,
        } as never);

        // Mock localStorage
        const getItemSpy = vi
          .spyOn(Storage.prototype, 'getItem')
          .mockReturnValue(JSON.stringify({value: 'test query'}));
        const removeItemSpy = vi
          .spyOn(Storage.prototype, 'removeItem')
          .mockImplementation(() => {});

        await element.initialize(commerceEngineConfig);
        await element.executeFirstRequest();

        expect(mockUpdateQuery).toHaveBeenCalledWith({query: 'test query'});
        expect(removeItemSpy).toHaveBeenCalledWith(
          StorageItems.STANDALONE_SEARCH_BOX_DATA
        );

        getItemSpy.mockRestore();
        removeItemSpy.mockRestore();
      });
    });

    describe('when initialized with product-listing interface', () => {
      it('should call executeFirstRequest', async () => {
        const element = await setupElement({type: 'product-listing'});
        const mockProductListing = buildFakeProductListing({
          implementation: {
            summary: () => mockProductListingSummary,
            urlManager: () => ({
              state: {fragment: ''},
              subscribe: vi.fn(() => vi.fn()),
              synchronize: vi.fn(),
            }),
            executeFirstRequest: vi.fn(),
          },
        });
        vi.mocked(buildProductListing).mockReturnValue(mockProductListing);

        await element.initialize(commerceEngineConfig);
        await element.executeFirstRequest();

        expect(mockProductListing.executeFirstRequest).toHaveBeenCalled();
      });
    });
  });

  // Properties watchers
  describe('when properties change after initialization', () => {
    let element: AtomicCommerceInterface;

    beforeEach(async () => {
      element = await setupElement();
      await element.initialize(commerceEngineConfig);
    });

    describe('when #language changes', () => {
      it('should update context language', async () => {
        const mockContext = buildFakeContext({});
        vi.mocked(buildContext).mockReturnValue(mockContext);
        await element.initialize(commerceEngineConfig);

        element.language = 'fr';
        await element.updateComplete;

        expect(mockContext.setLanguage).toHaveBeenCalledWith('fr');
      });

      it('should log an error when changing language before initialization', async () => {
        const uninitializedElement = await setupElement();
        const consoleErrorSpy = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {});

        uninitializedElement.language = 'fr';
        await uninitializedElement.updateComplete;

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'You have to call "initialize" on the atomic-commerce-interface component before modifying the props or calling other public methods.',
          uninitializedElement
        );
      });
    });

    describe('when #iconAssetsPath changes', () => {
      it('should update store iconAssetsPath', async () => {
        element.iconAssetsPath = '/new-assets';
        await element.updateComplete;

        expect(element.bindings.store.state.iconAssetsPath).toBe('/new-assets');
      });
    });

    describe('when #analytics changes', () => {
      it('should call interfaceController.onAnalyticsChange when analytics is toggled', async () => {
        const onAnalyticsChangeSpy = vi.spyOn(
          // biome-ignore lint/suspicious/noExplicitAny: accessing private property
          (element as any).interfaceController,
          'onAnalyticsChange'
        );

        element.analytics = false;
        await element.updateComplete;

        expect(onAnalyticsChangeSpy).toHaveBeenCalled();

        element.analytics = true;
        await element.updateComplete;

        expect(onAnalyticsChangeSpy).toHaveBeenCalledTimes(2);
      });
    });
  });

  // #disconnectedCallback
  describe('when removed from the DOM', () => {
    it('should remove aria-live element', async () => {
      const element = await setupElement();
      await element.initialize(commerceEngineConfig);

      expect(element.querySelector('atomic-aria-live')).toBeTruthy();

      element.disconnectedCallback();

      expect(element.querySelector('atomic-aria-live')).toBeFalsy();
    });

    it('should remove event listeners', async () => {
      const element = await setupElement();
      const removeEventListenerSpy = vi.spyOn(element, 'removeEventListener');

      element.disconnectedCallback();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'atomic/initializeComponent',
        expect.any(Function)
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'atomic/scrollToTop',
        expect.any(Function)
      );
    });

    it('should unsubscribe from URL manager', async () => {
      const element = await setupElement();
      const unsubscribeMock = vi.fn();
      const mockUrlManager = {
        state: {fragment: ''},
        subscribe: vi.fn(() => unsubscribeMock),
        synchronize: vi.fn(),
      };

      await element.initialize(commerceEngineConfig);
      element.urlManager = mockUrlManager;
      // biome-ignore lint/suspicious/noExplicitAny: accessing private property
      (element as any).unsubscribeUrlManager = unsubscribeMock;

      element.disconnectedCallback();

      expect(unsubscribeMock).toHaveBeenCalled();
    });
  });

  // #render
  it('should render a slot', async () => {
    const element = await setupElement();

    expect(element.shadowRoot?.querySelector('slot')).toBeTruthy();
  });

  it('should render its children', async () => {
    const element = await setupElement();
    await addChildElement(element);

    expect(within(element).queryByShadowText('test-element')).toBeTruthy();
  });

  // URL management
  describe('URL management', () => {
    it('should not initialize URL manager when disableStateReflectionInUrl is true', async () => {
      const element = await setupElement({disableStateReflectionInUrl: true});
      await element.initialize(commerceEngineConfig);

      expect(element.urlManager).toBeUndefined();
    });

    it('should not initialize URL manager when reflectStateInUrl is false', async () => {
      const element = await setupElement({reflectStateInUrl: false});
      await element.initialize(commerceEngineConfig);

      expect(element.urlManager).toBeUndefined();
    });

    it('should initialize URL manager when state reflection is enabled', async () => {
      const element = await setupElement({
        reflectStateInUrl: true,
        disableStateReflectionInUrl: false,
      });
      const mockUrlManager = {
        state: {fragment: ''},
        subscribe: vi.fn(() => vi.fn()),
        synchronize: vi.fn(),
      };
      const mockSearch = buildFakeSearch({
        implementation: {
          summary: () => mockSearchSummary,
          urlManager: () => mockUrlManager,
        },
      });

      vi.mocked(buildSearch).mockReturnValue(mockSearch);

      await element.initialize(commerceEngineConfig);

      expect(element.urlManager).toBeDefined();
    });
  });

  // Aria live management
  describe('Aria live management', () => {
    it('should add atomic-aria-live element when none exists', async () => {
      const element = await setupElement();
      await element.initialize(commerceEngineConfig);

      const ariaLiveElement = element.querySelector('atomic-aria-live');
      expect(ariaLiveElement).toBeTruthy();
    });

    it('should not add duplicate atomic-aria-live elements', async () => {
      const element = await setupElement();

      // Verify that after initialization, there's only one aria-live element
      await element.initialize(commerceEngineConfig);

      // Initialize again to test that it doesn't add duplicates
      element.connectedCallback();
      await element.initialize(commerceEngineConfig);

      const ariaLiveElements = element.querySelectorAll('atomic-aria-live');
      expect(ariaLiveElements.length).toBe(1);
    });
  });
});
