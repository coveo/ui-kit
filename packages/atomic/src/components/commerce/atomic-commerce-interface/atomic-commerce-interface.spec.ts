import {
  buildCommerceEngine,
  buildContext,
  buildProductListing,
  buildSearch,
  type CommerceEngineConfiguration,
  type ContextActionCreators,
  getSampleCommerceEngineConfiguration,
  type LogLevel,
  loadConfigurationActions,
  loadContextActions,
  loadQueryActions,
  type ProductListingSummaryState,
  type SearchSummaryState,
  type UrlManager,
} from '@coveo/headless/commerce';
import {html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import {when} from 'lit/directives/when.js';
import {within} from 'shadow-dom-testing-library';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockedFunction,
  type MockInstance,
  vi,
} from 'vitest';
import {InterfaceController} from '@/src/components/common/interface/interface-controller';
import {bindings} from '@/src/decorators/bindings';
import type {InitializableComponent} from '@/src/decorators/types';
import {markParentAsReady} from '@/src/utils/init-queue';
import {SafeStorage, StorageItems} from '@/src/utils/local-storage-utils';
import {DEFAULT_MOBILE_BREAKPOINT} from '@/src/utils/replace-breakpoint-utils';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {buildFakeContext} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/context-controller';
import {buildFakeCommerceEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/engine';
import {buildFakeProductListing} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product-listing-controller';
import {buildFakeSearch} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/search-controller';
import {buildFakeSummary} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/summary-subcontroller';
import '@/src/components/commerce/atomic-commerce-layout/atomic-commerce-layout';
import {getAnalyticsConfig} from './analytics-config';
import {
  AtomicCommerceInterface,
  type CommerceBindings,
} from './atomic-commerce-interface';
import {createCommerceStore} from './store';
import './atomic-commerce-interface';

vi.mock('@coveo/headless/commerce', {spy: true});
vi.mock('@/src/utils/init-queue', {spy: true});
vi.mock('./analytics-config', {spy: true});
vi.mock('./store', {spy: true});

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

  let mockUrlManager: UrlManager;

  const setupElement = async (
    props: {
      analytics?: boolean; // TODO - (v4) KIT-4990: remove.
      type?: 'search' | 'product-listing';
      disableStateReflectionInUrl?: boolean;
      iconAssetsPath?: string;
      language?: string; // TODO - (v4) KIT-4365: Remove.
      languageAssetsPath?: string;
      logLevel?: LogLevel;
      mobileBreakpoint?: string;
      reflectStateInUrl?: boolean; // TODO - (v4) KIT-4823: Remove.
      scrollContainer?: string;
    } = {}
  ) => {
    const element = (await fixture<AtomicCommerceInterface>(
      html`<atomic-commerce-interface
        analytics=${props.analytics}
        ?disable-state-reflection-in-url=${props.disableStateReflectionInUrl}
        icon-assets-path=${ifDefined(props.iconAssetsPath)}
        language=${ifDefined(props.language)}
        language-assets-path=${ifDefined(props.languageAssetsPath)}
        log-level=${ifDefined(props.logLevel)}
        reflect-state-in-url=${props.reflectStateInUrl}
        scroll-container=${ifDefined(props.scrollContainer)}
        type=${ifDefined(props.type)}
        >${when(props.mobileBreakpoint, () => html`<atomic-commerce-layout mobile-breakpoint=${ifDefined(props.mobileBreakpoint)}></atomic-commerce-layout>`)}<div>Interface content</div></atomic-commerce-layout></atomic-commerce-interface
      >`
    )) as AtomicCommerceInterface;

    expect(element).toBeInstanceOf(AtomicCommerceInterface);

    return element;
  };

  const addChildElement = async (element: Element, tag = 'test-element') => {
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

    mockUrlManager = {
      state: {fragment: ''},
      subscribe: vi.fn(() => vi.fn()),
      synchronize: vi.fn(),
    };

    vi.mocked(buildCommerceEngine).mockReturnValue(buildFakeCommerceEngine({}));
    vi.mocked(buildContext).mockReturnValue(buildFakeContext({}));
    vi.mocked(buildProductListing).mockReturnValue(
      buildFakeProductListing({
        implementation: {
          summary: () => mockProductListingSummary,
          urlManager: () => mockUrlManager,
          executeFirstRequest: vi.fn(),
        },
      })
    );
    vi.mocked(buildSearch).mockReturnValue(
      buildFakeSearch({
        implementation: {
          summary: () => mockSearchSummary,
          urlManager: () => mockUrlManager,
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

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('#constructor (when created)', () => {
    it('should create an i18n instance', async () => {
      const element = await setupElement();

      expect(element.i18n).toBeDefined();
    });

    // Done through the InterfaceController
    it('should prepend an aria-live element', async () => {
      const element = await setupElement();

      const ariaLive = element.firstElementChild;
      expect(ariaLive?.tagName).toBe('ATOMIC-ARIA-LIVE');
    });
  });

  describe('#connectedCallback (when added to the DOM)', () => {
    it("should add an 'atomic/initializeComponent' event listener on the element", async () => {
      const addEventListenerSpy = vi.spyOn(
        AtomicCommerceInterface.prototype,
        'addEventListener'
      );

      await setupElement();

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'atomic/initializeComponent',
        expect.any(Function)
      );
    });

    it("should call InterfaceController.onComponentInitializing when an 'atomic/initializeComponent' event is dispatched", async () => {
      const element = await setupElement();
      const onComponentInitializationSpy = vi.spyOn(
        InterfaceController.prototype,
        'onComponentInitializing'
      );
      const event = new CustomEvent('atomic/initializeComponent');

      element.dispatchEvent(event);

      expect(onComponentInitializationSpy).toHaveBeenCalledExactlyOnceWith(
        event
      );
    });

    it('should add an "atomic/scrollToTop" event listener on the element', async () => {
      const addEventListenerSpy = vi.spyOn(
        AtomicCommerceInterface.prototype,
        'addEventListener'
      );

      await setupElement();

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'atomic/scrollToTop',
        expect.any(Function)
      );
    });

    describe("when an 'atomic/scrollToTop' event is dispatched", () => {
      it('should log a warning when no element in the DOM matches the scrollContainer selector', async () => {
        const consoleWarnSpy = vi
          .spyOn(console, 'warn')
          .mockImplementation(() => {});
        const element = await setupElement({scrollContainer: 'i-do-not-exist'});
        const event = new CustomEvent('atomic/scrollToTop', {});

        element.dispatchEvent(event);

        expect(consoleWarnSpy).toHaveBeenCalledExactlyOnceWith(
          'Could not find the scroll container with the selector "i-do-not-exist". This will prevent UX interactions that require a scroll from working correctly. Please review the CSS selector in the scrollContainer option'
        );
      });

      it('should cause the element matching the scrollContainer selector to be smoothly scrolled into view when possible', async () => {
        const element = await setupElement();
        const scrollIntoViewSpy = vi.spyOn(element, 'scrollIntoView');
        const event = new CustomEvent('atomic/scrollToTop');

        element.dispatchEvent(event);

        expect(scrollIntoViewSpy).toHaveBeenCalledExactlyOnceWith({
          behavior: 'smooth',
        });
      });
    });
  });

  describe.for<{testedInitMethodName: 'initialize' | 'initializeWithEngine'}>([
    {
      testedInitMethodName: 'initialize',
    },
    {
      testedInitMethodName: 'initializeWithEngine',
    },
  ])('#$testedInitMethodName', ({testedInitMethodName}) => {
    const callTestedInitMethod = async (
      element: Awaited<ReturnType<typeof setupElement>>
    ) => {
      if (testedInitMethodName === 'initialize') {
        await element.initialize(commerceEngineConfig);
      } else {
        await element.initializeWithEngine(buildFakeCommerceEngine());
      }
    };

    it('should call InterfaceController.onInitialization', async () => {
      const element = await setupElement();
      const onInitializationSpy = vi.spyOn(
        InterfaceController.prototype,
        'onInitialization'
      );

      await callTestedInitMethod(element);

      expect(onInitializationSpy).toHaveBeenCalledExactlyOnceWith(
        expect.any(Function)
      );
    });

    it('should initialize the context with #buildContext', async () => {
      const element = await setupElement();
      const mockedBuildContext = vi.mocked(buildContext);

      await callTestedInitMethod(element);
      expect(mockedBuildContext).toHaveBeenCalledExactlyOnceWith(
        element.engine!
      );
      expect(element.context).toBe(mockedBuildContext.mock.results[0].value);
    });

    it('should call #updateLanguage once when the language prop is specified', async () => {
      const element = await setupElement({language: 'en'});
      const updateLanguageSpy = vi.spyOn(element, 'updateLanguage');

      await callTestedInitMethod(element);

      expect(updateLanguageSpy).toHaveBeenCalledOnce();
    });

    // TODO - (v4) KIT-4365: Eliminate the describe wrapper; we'll always set the language from the context state in v4.
    describe('when the language prop is not specified', () => {
      it('should set the language from the context state', async () => {
        const onLanguageChangeSpy = vi.spyOn(
          InterfaceController.prototype,
          'onLanguageChange'
        );
        const element = await setupElement();
        const fakeContext = buildFakeContext({
          state: {language: 'es'},
        });
        vi.mocked(buildContext).mockReturnValue(fakeContext);

        expect(element.language).toBeUndefined();

        await callTestedInitMethod(element);

        expect(onLanguageChangeSpy).toHaveBeenCalledExactlyOnceWith('es');
      });

      // TODO - (v4) KIT-4365: Remove this test in v4
      it('should call #updateLanguage', async () => {
        const element = await setupElement();
        const updateLanguageSpy = vi.spyOn(element, 'updateLanguage');

        await callTestedInitMethod(element);

        expect(updateLanguageSpy).toHaveBeenCalledOnce();
      });
    });

    it('should set the bindings', async () => {
      const mockedCreateCommerceStore = vi.mocked(createCommerceStore);
      const element = await setupElement();

      await callTestedInitMethod(element);

      expect(mockedCreateCommerceStore).toHaveBeenCalledExactlyOnceWith(
        element.type
      );

      expect(element.bindings).toEqual({
        engine: element.engine,
        i18n: element.i18n,
        store: mockedCreateCommerceStore.mock.results[0].value,
        interfaceElement: element,
      });
    });

    it('should provide bindings to its descendant components', async () => {
      const element = await setupElement();
      const childElement = await addChildElement(element);
      const descendantElement = await addChildElement(childElement);

      await callTestedInitMethod(element);

      expect(childElement.bindings).toEqual(element.bindings);
      expect(descendantElement.bindings).toEqual(element.bindings);
    });

    it('should trigger the initialize method of its descendant components', async () => {
      const element = await setupElement();
      const childElement = await addChildElement(element);
      const descendantElement = await addChildElement(childElement);

      await callTestedInitMethod(element);

      expect(childElement.initialize).toHaveBeenCalledOnce();
      expect(descendantElement.initialize).toHaveBeenCalledOnce();
    });

    it('should call the #markParentAsReady util function with the element as an argument', async () => {
      const element = await setupElement();

      await callTestedInitMethod(element);

      expect(markParentAsReady).toHaveBeenCalledExactlyOnceWith(element);
    });

    describe('when interface type is "product-listing"', () => {
      let element: Awaited<ReturnType<typeof setupElement>>;

      beforeEach(async () => {
        element = await setupElement({type: 'product-listing'});

        await callTestedInitMethod(element);
      });

      it('should set searchOrListing with #buildProductListing', async () => {
        expect(buildProductListing).toHaveBeenCalledExactlyOnceWith(
          element.engine!
        );
        expect(element.searchOrListing).toBe(
          vi.mocked(buildProductListing).mock.results[0].value
        );
      });

      it('should set the product listing summary', async () => {
        expect(element.summary).toBe(mockProductListingSummary);
      });

      it('should subscribe to the product listing summary state updates', async () => {
        expect(
          mockProductListingSummary.subscribe
        ).toHaveBeenCalledExactlyOnceWith(expect.any(Function));
      });
    });

    describe('when interface type is "search"', () => {
      let element: Awaited<ReturnType<typeof setupElement>>;

      beforeEach(async () => {
        element = await setupElement({type: 'search'});

        await callTestedInitMethod(element);
      });

      it('should set searchOrListing with #buildSearch', async () => {
        expect(buildSearch).toHaveBeenCalledExactlyOnceWith(element.engine!);
        expect(element.searchOrListing).toBe(
          vi.mocked(buildSearch).mock.results[0].value
        );
      });

      it('should initialize the search summary', async () => {
        expect(element.summary).toBe(mockSearchSummary);
      });

      it('should subscribe to the search summary state updates', async () => {
        expect(mockSearchSummary.subscribe).toHaveBeenCalledExactlyOnceWith(
          expect.any(Function)
        );
      });
    });

    describe('when the summary state changes', () => {
      it('should add the atomic-commerce-interface-no-results class when there are no products after the initial query', async () => {
        const mockedSummarySubscribe = vi.spyOn(mockSearchSummary, 'subscribe');
        const element = await setupElement({type: 'search'});
        await callTestedInitMethod(element);
        element.summary.state = {
          ...element.summary.state,
          firstRequestExecuted: true,
          hasError: false,
          hasProducts: false,
        };
        const summarySubscribeCallback =
          mockedSummarySubscribe.mock.calls[0][0];

        summarySubscribeCallback();

        expect(element.classList).toContain(
          'atomic-commerce-interface-no-results'
        );
      });

      it('should remove the atomic-commerce-interface-no-results class when there are products after the initial query', async () => {
        const mockedSummarySubscribe = vi.spyOn(mockSearchSummary, 'subscribe');
        const element = await setupElement({type: 'search'});
        await callTestedInitMethod(element);
        element.summary.state = {
          ...element.summary.state,
          firstRequestExecuted: true,
          hasError: false,
          hasProducts: true,
        };
        element.classList.add('atomic-commerce-interface-no-results');
        const summarySubscribeCallback =
          mockedSummarySubscribe.mock.calls[0][0];

        summarySubscribeCallback();

        expect(element.classList).not.toContain(
          'atomic-commerce-interface-no-results'
        );
      });

      it('should add the atomic-commerce-interface-error class when there is an error', async () => {
        const mockedSummarySubscribe = vi.spyOn(mockSearchSummary, 'subscribe');
        const element = await setupElement({type: 'search'});
        await callTestedInitMethod(element);
        element.summary.state = {
          ...element.summary.state,
          hasError: true,
        };
        const summarySubscribeCallback =
          mockedSummarySubscribe.mock.calls[0][0];

        summarySubscribeCallback();

        expect(element.classList).toContain('atomic-commerce-interface-error');
      });

      it('should remove the atomic-commerce-interface-error class when there is no error', async () => {
        const mockedSummarySubscribe = vi.spyOn(mockSearchSummary, 'subscribe');
        const element = await setupElement({type: 'search'});
        await callTestedInitMethod(element);
        element.summary.state = {
          ...element.summary.state,
          hasError: false,
        };
        element.classList.add('atomic-commerce-interface-error');
        const summarySubscribeCallback =
          mockedSummarySubscribe.mock.calls[0][0];

        summarySubscribeCallback();

        expect(element.classList).not.toContain(
          'atomic-commerce-interface-error'
        );
      });

      it('should add the atomic-commerce-interface-search-executed class when the first request was executed', async () => {
        const mockedSummarySubscribe = vi.spyOn(mockSearchSummary, 'subscribe');
        const element = await setupElement({type: 'search'});
        await callTestedInitMethod(element);
        element.summary.state = {
          ...element.summary.state,
          firstRequestExecuted: true,
        };
        const summarySubscribeCallback =
          mockedSummarySubscribe.mock.calls[0][0];

        summarySubscribeCallback();

        expect(element.classList).toContain(
          'atomic-commerce-interface-search-executed'
        );
      });

      it('should remove the atomic-commerce-interface-search-executed class when the first request was not executed', async () => {
        const mockedSummarySubscribe = vi.spyOn(mockSearchSummary, 'subscribe');
        const element = await setupElement({type: 'search'});
        await callTestedInitMethod(element);
        element.summary.state = {
          ...element.summary.state,
          firstRequestExecuted: false,
        };
        element.classList.add('atomic-commerce-interface-search-executed');
        const summarySubscribeCallback =
          mockedSummarySubscribe.mock.calls[0][0];

        summarySubscribeCallback();

        expect(element.classList).not.toContain(
          'atomic-commerce-interface-search-executed'
        );
      });

      it('should unset the loading flag when the first request was executed', async () => {
        const mockedSummarySubscribe = vi.spyOn(mockSearchSummary, 'subscribe');
        const element = await setupElement({type: 'search'});
        await callTestedInitMethod(element);
        element.summary.state = {
          ...element.summary.state,
          firstRequestExecuted: true,
        };
        const mockedUnsetLoadingFlag = vi.spyOn(
          element.bindings.store,
          'unsetLoadingFlag'
        );
        const summarySubscribeCallback =
          mockedSummarySubscribe.mock.calls[0][0];

        summarySubscribeCallback();

        expect(mockedUnsetLoadingFlag).toHaveBeenCalled();
      });
    });

    it('should not initialize the url manager when disableStateReflectionInUrl is true', async () => {
      const element = await setupElement({disableStateReflectionInUrl: true});

      await callTestedInitMethod(element);

      expect(element.urlManager).toBeUndefined();
    });

    it('should not initialize the url manager when reflectStateInUrl is false', async () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {}); // TODO: remove in v4 - This suppresses a deprecation warning for explicitly setting a boolean to false
      const element = await setupElement({reflectStateInUrl: false});

      await callTestedInitMethod(element);

      expect(element.urlManager).toBeUndefined();
    });

    describe('when disableStateReflectionInUrl is false and reflectStateInUrl is true', () => {
      let element: Awaited<ReturnType<typeof setupElement>>;
      let urlManagerSubscribeSpy: MockInstance;
      let addEventListenerSpy: MockInstance;

      beforeEach(async () => {
        element = await setupElement({
          disableStateReflectionInUrl: false,
          type: 'search',
        });

        urlManagerSubscribeSpy = vi.spyOn(mockUrlManager, 'subscribe');
        addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      });

      it('should initialize the urlManager with no hash when there is none', async () => {
        window.location.hash = '';

        const mockBuildUrlManager = vi.fn(() => mockUrlManager);

        vi.mocked(buildSearch).mockReturnValue(
          buildFakeSearch({
            implementation: {
              summary: () => mockSearchSummary,
              urlManager: mockBuildUrlManager,
              executeFirstSearch: vi.fn(),
            },
          })
        );

        await callTestedInitMethod(element);

        expect(mockBuildUrlManager).toHaveBeenCalledExactlyOnceWith({
          initialState: {fragment: ''},
        });
        expect(element.urlManager).toBeDefined();
        expect(element.urlManager).toBe(mockUrlManager);
      });

      it('should initialize the urlManager with the current hash when there is one', async () => {
        window.location.hash = '#initial-fragment';

        const mockBuildUrlManager = vi.fn(() => mockUrlManager);

        vi.mocked(buildSearch).mockReturnValue(
          buildFakeSearch({
            implementation: {
              summary: () => mockSearchSummary,
              urlManager: mockBuildUrlManager,
              executeFirstSearch: vi.fn(),
            },
          })
        );

        await callTestedInitMethod(element);

        expect(mockBuildUrlManager).toHaveBeenCalledExactlyOnceWith({
          initialState: {fragment: 'initial-fragment'},
        });
        expect(element.urlManager).toBeDefined();
        expect(element.urlManager).toBe(mockUrlManager);
      });

      it('should subscribe to the urlManager state updates', async () => {
        await callTestedInitMethod(element);

        expect(mockUrlManager.subscribe).toHaveBeenCalledExactlyOnceWith(
          expect.any(Function)
        );
      });

      describe('when the urlManager state changes', () => {
        let replaceStateSpy: MockInstance;
        let pushStateSpy: MockInstance;

        beforeEach(() => {
          replaceStateSpy = vi.spyOn(history, 'replaceState');
          pushStateSpy = vi.spyOn(history, 'pushState');
        });

        describe('when the interface is not loading', () => {
          let urlManagerSubscribeCallback: () => void;
          let loggerSpy: MockInstance;

          beforeEach(async () => {
            await callTestedInitMethod(element);

            element.searchOrListing.state.isLoading = false;
            element.urlManager!.state.fragment = 'test-fragment';
            urlManagerSubscribeCallback =
              urlManagerSubscribeSpy.mock.calls[0][0];

            loggerSpy = vi.spyOn(element.bindings.engine.logger, 'info');
          });

          it('should replace the history state with the #-prefixed new fragment', async () => {
            urlManagerSubscribeCallback();

            expect(replaceStateSpy).toHaveBeenCalledWith(
              null,
              document.title,
              '#test-fragment'
            );
          });

          it('should not call history.pushState', async () => {
            urlManagerSubscribeCallback();

            expect(pushStateSpy).not.toHaveBeenCalled();
          });

          it('should log the correct info message', async () => {
            urlManagerSubscribeCallback();

            expect(loggerSpy).toHaveBeenCalledExactlyOnceWith(
              `History replaceState #test-fragment`
            );
          });
        });

        describe('when the interface is loading', () => {
          let urlManagerSubscribeCallback: () => void;
          let loggerSpy: MockInstance;

          beforeEach(async () => {
            await callTestedInitMethod(element);

            element.searchOrListing.state.isLoading = true;
            element.urlManager!.state.fragment = 'test-fragment';
            urlManagerSubscribeCallback =
              urlManagerSubscribeSpy.mock.calls[0][0];

            loggerSpy = vi.spyOn(element.bindings.engine.logger, 'info');
          });

          it('should push the new fragment to the history state', async () => {
            urlManagerSubscribeCallback();

            expect(pushStateSpy).toHaveBeenCalledWith(
              null,
              document.title,
              '#test-fragment'
            );
          });

          it('should not call history.replaceState', async () => {
            urlManagerSubscribeCallback();

            expect(replaceStateSpy).not.toHaveBeenCalled();
          });

          it('should log the correct info message', async () => {
            urlManagerSubscribeCallback();

            expect(loggerSpy).toHaveBeenCalledWith(
              'History pushState #test-fragment'
            );
          });
        });
      });

      it('should add a hashchange event listener on the window object', async () => {
        await callTestedInitMethod(element);

        expect(addEventListenerSpy).toHaveBeenCalledWith(
          'hashchange',
          expect.any(Function)
        );
      });

      describe('when the hashchange event is dispatched on the window object', () => {
        it('should call urlManager.synchronize', async () => {
          await callTestedInitMethod(element);

          window.location.hash = '#new-fragment';
          window.dispatchEvent(new HashChangeEvent('hashchange'));

          expect(mockUrlManager.synchronize).toHaveBeenCalledExactlyOnceWith(
            'new-fragment'
          );
        });
      });
    });

    describe.skipIf(testedInitMethodName !== 'initialize')(
      '#initialize only',
      () => {
        it('should set the engine with #buildCommerceEngine', async () => {
          const element = await setupElement();

          await element.initialize(commerceEngineConfig);

          expect(element.engine).toBe(
            vi.mocked(buildCommerceEngine).mock.results[0].value
          );
        });

        it('should pass the specified configuration and log level, along with an analytics configuration augmented with #getAnalyticsConfig to #buildCommerceEngine when setting the engine', async () => {
          const mockedGetAnalyticsConfig = vi.mocked(getAnalyticsConfig);
          const element = await setupElement();

          await element.initialize(commerceEngineConfig);

          expect(getAnalyticsConfig).toHaveBeenCalledExactlyOnceWith(
            commerceEngineConfig,
            element.analytics
          );
          expect(buildCommerceEngine).toHaveBeenCalledExactlyOnceWith({
            configuration: {
              ...commerceEngineConfig,
              analytics: mockedGetAnalyticsConfig.mock.results[0].value,
            },
            loggerOptions: {level: element.logLevel},
          });
        });

        it('should set the error when #buildCommerceEngine throws', async () => {
          vi.spyOn(console, 'error').mockImplementation(() => {});
          const element = await setupElement();
          const buildEngineError = new Error('Oh no!', {
            cause: 'A noble cause',
          });

          vi.mocked(buildCommerceEngine).mockImplementation(() => {
            throw buildEngineError;
          });

          await element.initialize(commerceEngineConfig).catch(() => {});

          expect(element.engine).toBeUndefined();
          expect(element.error).toBe(buildEngineError);
        });
      }
    );

    describe.skipIf(testedInitMethodName !== 'initializeWithEngine')(
      '#initializeWithEngine only',
      () => {
        it('should dispatch an updateAnalyticsConfiguration action with the correct source and trackingId', async () => {
          const element = await setupElement();
          const engine = buildFakeCommerceEngine();
          engine.configuration.analytics.trackingId = 'test-tracking-id';
          const updateAnalyticsConfigurationMock = vi.fn();
          vi.mocked(loadConfigurationActions).mockReturnValue({
            updateAnalyticsConfiguration: updateAnalyticsConfigurationMock,
            disableAnalytics: vi.fn(),
            enableAnalytics: vi.fn(),
            updateBasicConfiguration: vi.fn(),
            updateProxyBaseUrl: vi.fn(),
          });

          await element.initializeWithEngine(engine);

          expect(updateAnalyticsConfigurationMock).toHaveBeenCalledWith({
            trackingId: 'test-tracking-id',
            source: {'@coveo/atomic': '0.0.0'},
          });
        });

        it('should initialize with a preconfigured engine', async () => {
          const element = await setupElement();
          const engine = buildFakeCommerceEngine();
          engine.configuration.organizationId = 'oh-la-la';

          await element.initializeWithEngine(engine);

          expect(element.engine).toBe(engine);
          expect(element.engine!.configuration.organizationId).toBe('oh-la-la');
        });
      }
    );

    it('should update the mobile breakpoint from atomic-commerce-layout when available', async () => {
      const element = await setupElement({mobileBreakpoint: '768px'});

      await callTestedInitMethod(element);

      expect(element.bindings.store.state.mobileBreakpoint).toBe('768px');
    });

    it('should keep the default mobile breakpoint when no atomic-commerce-layout exists', async () => {
      const element = await setupElement();

      await callTestedInitMethod(element);

      expect(element.bindings.store.state.mobileBreakpoint).toBe(
        DEFAULT_MOBILE_BREAKPOINT
      );
    });
  });

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

    it('should log an error when called before initialization finishes', async () => {
      const element = await setupElement();
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      element.engine = buildFakeCommerceEngine({}); // Simulate that the engine was created but the interface wasn't initialized

      await element.executeFirstRequest();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'You have to wait until the "initialize" promise is fulfilled before executing a request.',
        element
      );
    });

    describe('when interface type is "search"', () => {
      let element: AtomicCommerceInterface;

      beforeEach(async () => {
        element = await setupElement({type: 'search'});
      });

      it('should call executeFirstSearch', async () => {
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

        expect(mockSearch.executeFirstSearch).toHaveBeenCalledOnce();
      });

      it('should not dispatch an updateQuery action when standalone search box data does not exist', async () => {
        const updateQueryMock = vi.fn();
        vi.mocked(loadQueryActions).mockReturnValue({
          updateQuery: updateQueryMock,
        });
        await element.initialize(commerceEngineConfig);

        await element.executeFirstRequest();

        expect(updateQueryMock).not.toHaveBeenCalled();
      });

      describe('when standalone search box data exists', () => {
        beforeEach(() => {
          vi.spyOn(SafeStorage.prototype, 'getParsedJSON').mockReturnValue({
            value: 'test query',
          });
        });

        it('should remove the standalone search box data from local storage', async () => {
          const removeItemSpy = vi
            .spyOn(SafeStorage.prototype, 'removeItem')
            .mockImplementation(() => {});
          await element.initialize(commerceEngineConfig);

          await element.executeFirstRequest();

          expect(removeItemSpy).toHaveBeenCalledExactlyOnceWith(
            StorageItems.STANDALONE_SEARCH_BOX_DATA
          );
        });

        it('should dispatch an updateQuery action with the new query', async () => {
          const updateQueryMock = vi.fn();
          vi.mocked(loadQueryActions).mockReturnValue({
            updateQuery: updateQueryMock,
          });
          await element.initialize(commerceEngineConfig);

          await element.executeFirstRequest();

          expect(updateQueryMock).toHaveBeenCalledExactlyOnceWith({
            query: 'test query',
          });
        });
      });
    });

    describe('when interface type is "product-listing"', () => {
      let element: AtomicCommerceInterface;

      beforeEach(async () => {
        element = await setupElement({type: 'product-listing'});
      });

      it('should call executeFirstRequest', async () => {
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

        expect(mockProductListing.executeFirstRequest).toHaveBeenCalledOnce();
      });

      describe('when standalone search box data exists', () => {
        beforeEach(() => {
          vi.spyOn(SafeStorage.prototype, 'getParsedJSON').mockReturnValue({
            value: 'test query',
          });
        });

        it('should not remove the standalone search box data from local storage', async () => {
          const removeItemSpy = vi
            .spyOn(SafeStorage.prototype, 'removeItem')
            .mockImplementation(() => {});
          await element.initialize(commerceEngineConfig);

          await element.executeFirstRequest();

          expect(removeItemSpy).not.toHaveBeenCalled();
        });

        it('should not dispatch an updateQuery action', async () => {
          const updateQueryMock = vi.fn();
          vi.mocked(loadQueryActions).mockReturnValue({
            updateQuery: updateQueryMock,
          });
          await element.initialize(commerceEngineConfig);

          await element.executeFirstRequest();

          expect(updateQueryMock).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('#updateLocale', () => {
    it('should do nothing when the engine has not been created', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      const element = await setupElement();
      const onLanguageChangeSpy = vi.spyOn(
        InterfaceController.prototype,
        'onLanguageChange'
      );
      const setContextMock = vi.fn();
      vi.mocked(loadContextActions, {partial: true}).mockReturnValue({
        setContext: setContextMock,
      });

      element.updateLocale('fr', 'FR', 'EUR');

      expect(onLanguageChangeSpy).not.toHaveBeenCalled();
      expect(setContextMock).not.toHaveBeenCalled();
    });

    it('should do nothing when the context is not defined', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(buildContext).mockReturnValue(undefined as never);
      const element = await setupElement();
      const engine = buildFakeCommerceEngine();
      element.initializeWithEngine(engine);
      const onLanguageChangeSpy = vi.spyOn(
        InterfaceController.prototype,
        'onLanguageChange'
      );
      const setContextMock = vi.fn();
      vi.mocked(loadContextActions, {partial: true}).mockReturnValue({
        setContext: setContextMock,
      });

      element.updateLocale('fr', 'FR', 'EUR');

      expect(onLanguageChangeSpy).not.toHaveBeenCalled();
      expect(setContextMock).not.toHaveBeenCalled();
    });

    describe('when the engine has been created and the context is defined', () => {
      let element: AtomicCommerceInterface;
      let engine: ReturnType<typeof buildFakeCommerceEngine>;
      let onLanguageChangeSpy: MockedFunction<
        typeof InterfaceController.prototype.onLanguageChange
      >;
      let setContextMock: MockedFunction<ContextActionCreators['setContext']>;

      beforeEach(async () => {
        element = await setupElement();
        engine = buildFakeCommerceEngine({});

        await element.initializeWithEngine(engine);

        setContextMock = vi.fn();
        onLanguageChangeSpy = vi.spyOn(
          InterfaceController.prototype,
          'onLanguageChange'
        );
        onLanguageChangeSpy.mockClear();

        vi.mocked(loadContextActions).mockImplementation(() => ({
          setContext: setContextMock,
        }));
      });

      it('should call InterfaceController.onLanguageChange when the language parameter is provided', async () => {
        element.updateLocale('fr');

        expect(onLanguageChangeSpy).toHaveBeenCalledExactlyOnceWith('fr');
      });

      it('should not call InterfaceController.onLanguageChange when the language parameter is not provided', async () => {
        element.updateLocale(undefined, 'FR', 'EUR');

        expect(onLanguageChangeSpy).not.toHaveBeenCalled();
      });

      it('should dispatch a setContext action with the new language when it is defined and different from the language value in the context', async () => {
        element.updateLocale('fr');

        expect(setContextMock).toHaveBeenCalledExactlyOnceWith({
          ...element.context.state,
          language: 'fr',
        });
      });

      it('should dispatch a setContext action with the new country when it is defined and different from the country value in the context', async () => {
        element.updateLocale(undefined, 'FR');

        expect(setContextMock).toHaveBeenCalledExactlyOnceWith({
          ...element.context.state,
          country: 'FR',
        });
      });

      it('should dispatch a setContext action with the new currency when it is defined and different from the currency value in the context', async () => {
        element.updateLocale(undefined, undefined, 'EUR');

        expect(setContextMock).toHaveBeenCalledExactlyOnceWith({
          ...element.context.state,
          currency: 'EUR',
        });
      });

      it('should dispatch a setContext action with all values when all parameters are provided and any of them is different from its corresponding value in the context', async () => {
        element.updateLocale('fr', 'US', 'USD'); // Only 'fr' is different

        expect(setContextMock).toHaveBeenCalledExactlyOnceWith({
          ...element.context.state,
          language: 'fr',
          country: 'US',
          currency: 'USD',
        });
      });

      it('should not dispatch a setContext action when each provided parameters is identical to its corresponding value in the context', async () => {
        element.updateLocale('en', 'US', 'USD');

        expect(setContextMock).not.toHaveBeenCalled();
      });
    });
  });

  // #toggleAnalytics
  it('should call InterfaceController.onAnalyticsChange when the analytics attribute changes', async () => {
    const element = await setupElement();
    await element.initialize(commerceEngineConfig);
    const onAnalyticsChangeSpy = vi.spyOn(
      InterfaceController.prototype,
      'onAnalyticsChange'
    );

    expect(onAnalyticsChangeSpy).not.toHaveBeenCalled();

    element.analytics = false;
    await element.updateComplete;

    expect(onAnalyticsChangeSpy).toHaveBeenCalledOnce();

    element.analytics = true;
    await element.updateComplete;

    expect(onAnalyticsChangeSpy).toHaveBeenCalledTimes(2);
  });

  // #updateIconAssetsPath
  it('should update the icon assets path in the bindings when the iconAssetsPath attribute changes', async () => {
    const element = await setupElement();
    await element.initialize(commerceEngineConfig);

    expect(element.bindings.store.state.iconAssetsPath).not.toBe(
      '/new/icon/assets/path'
    );

    element.iconAssetsPath = '/new/icon/assets/path';
    await element.updateComplete;

    expect(element.bindings.store.state.iconAssetsPath).toBe(
      '/new/icon/assets/path'
    );
  });

  // #updateLanguage
  // TODO - (v4) KIT-4365: Remove these tests.
  describe('when the language attribute changes', () => {
    it('should do nothing when the engine has not been created', async () => {
      const onLanguageChangeSpy = vi.spyOn(
        InterfaceController.prototype,
        'onLanguageChange'
      );
      const element = await setupElement({language: 'en'});

      element.language = 'fr';
      await element.updateComplete;

      expect(element.engine).toBeUndefined();
      expect(onLanguageChangeSpy).not.toHaveBeenCalled();
    });

    it('should do nothing when the new language attribute is undefined', async () => {
      const onLanguageChangeSpy = vi.spyOn(
        InterfaceController.prototype,
        'onLanguageChange'
      );
      const element = await setupElement({language: 'en'});

      element.language = undefined;
      await element.updateComplete;

      expect(element.context).toBeUndefined();
      expect(onLanguageChangeSpy).not.toHaveBeenCalled();
    });

    it('should do nothing when the context is not defined', async () => {
      const onLanguageChangeSpy = vi.spyOn(
        InterfaceController.prototype,
        'onLanguageChange'
      );
      const element = await setupElement({language: 'en'});
      element.engine = buildFakeCommerceEngine(); // Simulate that the engine was created but the context wasn't built

      element.language = 'fr';
      await element.updateComplete;

      expect(element.context).toBeUndefined();
      expect(onLanguageChangeSpy).not.toHaveBeenCalled();
    });

    describe('when the engine has been created & the language attribute is defined & the context is defined', () => {
      it('should log a deprecation warning', async () => {
        const element = await setupElement();
        const engine = buildFakeCommerceEngine();
        await element.initializeWithEngine(engine);

        element.language = 'fr';
        await element.updateComplete;

        expect(engine.logger.warn).toHaveBeenCalledExactlyOnceWith(
          'The `language` property will be removed in the next major version of Atomic (v4). Rather than using this property, set the initial language through the engine configuration when calling `initialize` or `initializeWithEngine`, and update the language as needed using the `updateLocale` method.'
        );
      });

      it('should call InterfaceController.onLanguageChange with no argument', async () => {
        const onLanguageChangeSpy = vi.spyOn(
          InterfaceController.prototype,
          'onLanguageChange'
        );
        const element = await setupElement({language: 'en'});
        await element.initialize(commerceEngineConfig);
        await element.updateComplete;
        onLanguageChangeSpy.mockClear();

        element.language = 'fr';
        await element.updateComplete;

        expect(onLanguageChangeSpy).toHaveBeenCalledExactlyOnceWith();
      });
    });
  });

  describe('#disconnectedCallback (when removed from the DOM)', () => {
    // Done through the InterfaceController
    it('should remove aria-live element', async () => {
      const element = await setupElement();
      await element.initialize(commerceEngineConfig);

      expect(element.querySelector('atomic-aria-live')).toBeTruthy();

      element.remove();

      expect(element.querySelector('atomic-aria-live')).toBeFalsy();
    });

    it('should unsubscribe from urlManager state updates when subscribed', async () => {
      const element = await setupElement({
        reflectStateInUrl: true,
        disableStateReflectionInUrl: false,
        type: 'search',
      });
      const unsubscribeMock = vi.fn();
      mockUrlManager.subscribe = vi.fn(() => unsubscribeMock);
      await element.initialize(commerceEngineConfig);

      element.remove();

      expect(unsubscribeMock).toHaveBeenCalled();
    });

    it('should unsubscribe from summary state updates when subscribed', async () => {
      const element = await setupElement({type: 'search'});
      const unsubscribeMock = vi.fn();
      mockSearchSummary.subscribe = vi.fn(() => unsubscribeMock);
      await element.initialize(commerceEngineConfig);

      element.remove();

      expect(unsubscribeMock).toHaveBeenCalled();
    });

    it('should remove the hashchange event listener on the window object', async () => {
      const element = await setupElement({
        reflectStateInUrl: true,
        disableStateReflectionInUrl: false,
        type: 'search',
      });
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      await element.initialize(commerceEngineConfig);

      element.remove();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'hashchange',
        expect.any(Function)
      );
    });

    it('should remove the atomic/initializeComponent event listener', async () => {
      const element = await setupElement();
      const removeEventListenerSpy = vi.spyOn(element, 'removeEventListener');

      element.remove();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'atomic/initializeComponent',
        expect.any(Function)
      );
    });

    it('should remove the atomic/scrollToTop event listener', async () => {
      const element = await setupElement();
      const removeEventListenerSpy = vi.spyOn(element, 'removeEventListener');

      element.remove();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'atomic/scrollToTop',
        expect.any(Function)
      );
    });
  });

  describe('when rendering (#render)', () => {
    it('should render a slot', async () => {
      const element = await setupElement();

      expect(element.shadowRoot?.querySelector('slot')).toBeTruthy();
    });

    it('should render its children', async () => {
      const element = await setupElement();
      await addChildElement(element);

      expect(within(element).queryByShadowText('test-element')).toBeTruthy();
    });
  });
});
