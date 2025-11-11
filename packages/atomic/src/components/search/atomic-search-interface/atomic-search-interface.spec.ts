import {
  buildSearchEngine,
  buildSearchStatus,
  buildUrlManager,
  EcommerceDefaultFieldsToInclude,
  getSampleSearchEngineConfiguration,
  loadConfigurationActions,
  loadFieldActions,
  loadQueryActions,
  loadSearchConfigurationActions,
  type SearchEngineConfiguration,
  type UrlManager,
} from '@coveo/headless';
import {html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import {when} from 'lit/directives/when.js';
import {within} from 'shadow-dom-testing-library';
import {beforeEach, describe, expect, it, type MockInstance, vi} from 'vitest';
import {augmentAnalyticsConfigWithAtomicVersion} from '@/src/components/common/interface/analytics-config';
import {InterfaceController} from '@/src/components/common/interface/interface-controller';
import {createSearchStore} from '@/src/components/search/atomic-search-interface/store';
import {bindings} from '@/src/decorators/bindings';
import type {InitializableComponent} from '@/src/decorators/types';
import {markParentAsReady} from '@/src/utils/init-queue';
import {SafeStorage, StorageItems} from '@/src/utils/local-storage-utils';
import {DEFAULT_MOBILE_BREAKPOINT} from '@/src/utils/replace-breakpoint-utils';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import {buildFakeSearchStatus} from '@/vitest-utils/testing-helpers/fixtures/headless/search/search-status-controller';
import {buildFakeUrlManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/url-manager-controller';
import {getAnalyticsConfig} from './analytics-config';
import {AtomicSearchInterface, type Bindings} from './atomic-search-interface';
import './atomic-search-interface';
import '@/src/components/search/atomic-search-layout/atomic-search-layout';

vi.mock('@coveo/headless', {spy: true});
vi.mock('@/src/components/common/interface/analytics-config', {spy: true});
vi.mock('@/src/components/search/atomic-search-interface/store', {spy: true});
vi.mock('@/src/utils/init-queue', {spy: true});
vi.mock('./analytics-config', {spy: true});

@customElement('test-element')
@bindings()
class TestElement
  extends LitElement
  implements InitializableComponent<Bindings>
{
  @state()
  public bindings: Bindings = {} as Bindings;
  @state() public error!: Error;

  public initialize = vi.fn();

  public render() {
    return html`test-element`;
  }
}

describe('atomic-search-interface', () => {
  const searchEngineConfig: SearchEngineConfiguration =
    getSampleSearchEngineConfiguration();
  let mockUrlManager: UrlManager;

  const setupElement = async (
    props: {
      analytics?: boolean;
      disableStateReflectionInUrl?: boolean;
      iconAssetsPath?: string;
      language?: string;
      languageAssetsPath?: string;
      logLevel?:
        | 'debug'
        | 'fatal'
        | 'error'
        | 'warn'
        | 'info'
        | 'trace'
        | 'silent';
      mobileBreakpoint?: string;
      fieldsToInclude?: string[];
      pipeline?: string;
      searchHub?: string;
      timezone?: string;
      reflectStateInUrl?: boolean; // TODO - (v4) KIT-4823: Remove.
      scrollContainer?: string;
      enableRelevanceInspector?: boolean; // TODO - (v4) KIT-5004: Remove.
      disableRelevanceInspector?: boolean;
    } = {}
  ) => {
    const element = (await fixture<AtomicSearchInterface>(
      html`<atomic-search-interface
        ?analytics=${props.analytics}
        ?disable-state-reflection-in-url=${props.disableStateReflectionInUrl}
        icon-assets-path=${ifDefined(props.iconAssetsPath)}
        language=${ifDefined(props.language)}
        language-assets-path=${ifDefined(props.languageAssetsPath)}
        log-level=${ifDefined(props.logLevel)}
        .fieldsToInclude=${props.fieldsToInclude || []}
        pipeline=${ifDefined(props.pipeline)}
        search-hub=${ifDefined(props.searchHub)}
        timezone=${ifDefined(props.timezone)}
        reflect-state-in-url=${props.reflectStateInUrl}
        scroll-container=${ifDefined(props.scrollContainer)}
        enable-relevance-inspector=${props.enableRelevanceInspector}
        ?disable-relevance-inspector=${props.disableRelevanceInspector}
      >${when(props.mobileBreakpoint, () => html`<atomic-search-layout mobile-breakpoint=${ifDefined(props.mobileBreakpoint)}></atomic-search-layout>`)}<div>Interface content</div></atomic-search-layout>
      </atomic-search-interface>`
    )) as AtomicSearchInterface;

    expect(element).toBeInstanceOf(AtomicSearchInterface);
    return element;
  };

  const addChildElement = async (element: Element, tag = 'test-element') => {
    const childElement = document.createElement(
      tag
    ) as InitializableComponent<Bindings> & TestElement;
    element.appendChild(childElement);

    await childElement.updateComplete;
    expect(childElement).toBeInstanceOf(TestElement);

    return childElement;
  };

  beforeEach(() => {
    mockUrlManager = {
      state: {fragment: ''},
      subscribe: vi.fn(() => vi.fn()),
      synchronize: vi.fn(),
    };

    vi.mocked(buildSearchEngine).mockReturnValue(
      buildFakeSearchEngine({
        implementation: {
          executeFirstSearch: vi.fn(),
        },
      })
    );

    vi.mocked(buildSearchStatus).mockReturnValue(buildFakeSearchStatus());

    vi.mocked(buildUrlManager).mockReturnValue(mockUrlManager);

    vi.mocked(buildUrlManager).mockReturnValue(buildFakeUrlManager());

    vi.mocked(loadFieldActions, {partial: true}).mockReturnValue({
      registerFieldsToInclude: vi.fn(),
    });

    vi.mocked(loadQueryActions, {partial: true}).mockReturnValue({
      updateQuery: vi.fn(),
    });

    vi.mocked(loadSearchConfigurationActions, {partial: true}).mockReturnValue({
      updateSearchConfiguration: vi.fn(),
    });

    vi.mocked(loadConfigurationActions, {partial: true}).mockReturnValue({
      updateAnalyticsConfiguration: vi.fn(),
    });

    vi.mocked(augmentAnalyticsConfigWithAtomicVersion).mockReturnValue({
      source: {
        '@coveo/atomic': '1.0.0',
      },
    });
  });

  describe('#constructor (when created)', () => {
    it('should create an i18n instance', async () => {
      const element = await setupElement();

      expect(element.i18n).toBeDefined();
    });

    it('should prepend an aria-live element', async () => {
      const element = await setupElement();

      const ariaLive = element.firstElementChild;
      expect(ariaLive?.tagName).toBe('ATOMIC-ARIA-LIVE');
    });
  });

  describe('#connectedCallback (when added to the DOM)', () => {
    it("should add an 'atomic/initializeComponent' event listener on the element", async () => {
      const addEventListenerSpy = vi.spyOn(
        AtomicSearchInterface.prototype,
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

    it('should initialize fields before engine initialization', async () => {
      const element = await setupElement();
      await element.initialize(searchEngineConfig);

      expect(element.bindings.store.state.fieldsToInclude).toEqual(
        expect.arrayContaining(EcommerceDefaultFieldsToInclude)
      );
    });

    it('should add an "atomic/scrollToTop" event listener on the element', async () => {
      const addEventListenerSpy = vi.spyOn(
        AtomicSearchInterface.prototype,
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
        const element = await setupElement({scrollContainer: 'i-do-not-exist'});
        await element.initialize(searchEngineConfig);

        const loggerWarnSpy = vi.spyOn(element.bindings.engine.logger, 'warn');

        const event = new CustomEvent('atomic/scrollToTop', {});

        element.dispatchEvent(event);

        expect(loggerWarnSpy).toHaveBeenCalledExactlyOnceWith(
          'Could not find the scroll container with the selector "i-do-not-exist". This will prevent UX interactions that require a scroll from working correctly. Please review the CSS selector in the scrollContainer option'
        );
      });

      it('should cause the element matching the scrollContainer selector to be smoothly scrolled into view when possible', async () => {
        const element = await setupElement();
        await element.initialize(searchEngineConfig);

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
        await element.initialize(searchEngineConfig);
      } else {
        await element.initializeWithSearchEngine(buildFakeSearchEngine());
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

    it('should call #updateLanguage once when the language prop is specified', async () => {
      const element = await setupElement({language: 'en'});
      const updateLanguageSpy = vi.spyOn(element, 'updateLanguage');

      await callTestedInitMethod(element);

      expect(updateLanguageSpy).toHaveBeenCalledOnce();
    });

    describe('when the language prop is not specified', () => {
      it('should keep the default language value', async () => {
        const element = await setupElement();

        expect(element.language).toBe('en');

        await callTestedInitMethod(element);

        expect(element.language).toBe('en');
      });

      it('should call #updateLanguage once', async () => {
        const element = await setupElement();
        const updateLanguageSpy = vi.spyOn(element, 'updateLanguage');

        await callTestedInitMethod(element);

        expect(updateLanguageSpy).toHaveBeenCalledOnce();
      });
    });

    it('should set the bindings', async () => {
      const mockedCreateStore = vi.mocked(createSearchStore);
      const element = await setupElement();

      await callTestedInitMethod(element);

      expect(mockedCreateStore).toHaveBeenCalledExactlyOnceWith();

      expect(element.bindings).toEqual({
        engine: element.engine,
        i18n: element.i18n,
        store: mockedCreateStore.mock.results[0].value,
        interfaceElement: element,
        createStyleElement: expect.any(Function),
        createScriptElement: expect.any(Function),
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
        });
        vi.mocked(buildUrlManager).mockReturnValue(mockUrlManager);

        urlManagerSubscribeSpy = vi.spyOn(mockUrlManager, 'subscribe');
        addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      });

      it('should initialize the urlManager with no hash when there is none', async () => {
        window.location.hash = '';

        await callTestedInitMethod(element);

        expect(buildUrlManager).toHaveBeenCalledExactlyOnceWith(
          element.engine,
          {
            initialState: {fragment: ''},
          }
        );
        expect(element.urlManager).toBeDefined();
        expect(element.urlManager).toBe(mockUrlManager);
      });

      it('should initialize the urlManager with the current hash when there is one', async () => {
        window.location.hash = '#initial-fragment';

        vi.mocked(buildUrlManager).mockReturnValue(mockUrlManager);

        await callTestedInitMethod(element);

        expect(buildUrlManager).toHaveBeenCalledExactlyOnceWith(
          element.engine,
          {
            initialState: {fragment: 'initial-fragment'},
          }
        );
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

        describe('when the first search has not been executed', () => {
          let urlManagerSubscribeCallback: () => void;
          let loggerSpy: MockInstance;

          beforeEach(async () => {
            await callTestedInitMethod(element);

            element.searchStatus.state.firstSearchExecuted = false;
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

        describe('when the first search has been executed', () => {
          let urlManagerSubscribeCallback: () => void;
          let loggerSpy: MockInstance;

          beforeEach(async () => {
            await callTestedInitMethod(element);

            element.searchStatus.state.firstSearchExecuted = true;
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
        it('should set the engine with #buildSearchEngine', async () => {
          const element = await setupElement();

          await element.initialize(searchEngineConfig);

          expect(element.engine).toBe(
            vi.mocked(buildSearchEngine).mock.results[0].value
          );
        });

        it('should pass the specified configuration and log level, along with an analytics configuration augmented with #getAnalyticsConfig to #buildSearchEngine when setting the engine', async () => {
          const mockedGetAnalyticsConfig = vi.mocked(getAnalyticsConfig);
          const element = await setupElement();

          await element.initialize(searchEngineConfig);

          expect(getAnalyticsConfig).toHaveBeenCalledExactlyOnceWith(
            searchEngineConfig,
            element.analytics,
            element.bindings.store
          );
          expect(buildSearchEngine).toHaveBeenCalledExactlyOnceWith({
            configuration: {
              ...searchEngineConfig,
              search: {
                searchHub: 'default',
                pipeline: undefined,
                locale: 'en',
                timezone: undefined,
              },
              analytics: mockedGetAnalyticsConfig.mock.results[0].value,
            },
            loggerOptions: {level: element.logLevel},
          });
        });

        it('should use searchHub from options.search when both property and options.search are provided', async () => {
          const element = await setupElement({searchHub: 'property-hub'});

          await element.initialize({
            ...searchEngineConfig,
            search: {searchHub: 'options-hub'},
          });

          expect(buildSearchEngine).toHaveBeenCalledWith(
            expect.objectContaining({
              configuration: expect.objectContaining({
                search: expect.objectContaining({
                  searchHub: 'options-hub',
                }),
              }),
            })
          );
        });

        it('should use pipeline from options.search when both property and options.search are provided', async () => {
          const element = await setupElement({pipeline: 'property-pipeline'});

          await element.initialize({
            ...searchEngineConfig,
            search: {pipeline: 'options-pipeline'},
          });

          expect(buildSearchEngine).toHaveBeenCalledWith(
            expect.objectContaining({
              configuration: expect.objectContaining({
                search: expect.objectContaining({
                  pipeline: 'options-pipeline',
                }),
              }),
            })
          );
        });

        it('should set the error when #buildSearchEngine throws', async () => {
          vi.spyOn(console, 'error').mockImplementation(() => {});
          const element = await setupElement();
          const buildEngineError = new Error('Oh no!', {
            cause: 'A noble cause',
          });

          vi.mocked(buildSearchEngine).mockImplementation(() => {
            throw buildEngineError;
          });

          await element.initialize(searchEngineConfig).catch(() => {});

          expect(element.engine).toBeUndefined();
          expect(element.error).toBe(buildEngineError);
        });
      }
    );

    describe.skipIf(testedInitMethodName !== 'initializeWithEngine')(
      '#initializeWithEngine only',
      () => {
        it('should initialize with a preconfigured engine', async () => {
          const element = await setupElement();
          const engine = buildFakeSearchEngine({
            state: {
              configuration: {
                organizationId: 'oh-la-la',
              },
            },
          });

          await element.initializeWithSearchEngine(engine);

          expect(element.engine).toBe(engine);
          expect(element.engine!.state.configuration.organizationId).toBe(
            'oh-la-la'
          );
        });

        it('should warn when there is a pipeline mismatch', async () => {
          const consoleWarnSpy = vi
            .spyOn(console, 'warn')
            .mockImplementation(() => {});
          const element = await setupElement({pipeline: 'test-pipeline'});
          const engine = buildFakeSearchEngine({
            state: {
              pipeline: 'different-pipeline',
            },
          });

          await element.initializeWithSearchEngine(engine);

          expect(consoleWarnSpy).toHaveBeenCalledWith(
            'Mismatch between search interface pipeline and engine pipeline. The engine pipeline will be used.'
          );
        });

        it('should warn when there is a searchHub mismatch', async () => {
          const consoleWarnSpy = vi
            .spyOn(console, 'warn')
            .mockImplementation(() => {});
          const element = await setupElement({searchHub: 'test-hub'});
          const engine = buildFakeSearchEngine({
            state: {
              searchHub: 'different-hub',
            },
          });

          await element.initializeWithSearchEngine(engine);

          expect(consoleWarnSpy).toHaveBeenCalledWith(
            'Mismatch between search interface search hub and engine search hub. The engine search hub will be used.'
          );
        });

        it('should dispatch updateAnalyticsConfiguration with augmented analytics config', async () => {
          const element = await setupElement();
          const mockDispatch = vi.fn();
          const mockUpdateAnalyticsConfiguration = vi.fn();
          const engine = buildFakeSearchEngine({
            implementation: {
              dispatch: mockDispatch,
            },
          });

          vi.mocked(loadConfigurationActions, {partial: true}).mockReturnValue({
            updateAnalyticsConfiguration: mockUpdateAnalyticsConfiguration,
          });

          await element.initializeWithSearchEngine(engine);

          expect(loadConfigurationActions).toHaveBeenCalledWith(engine);
          expect(mockUpdateAnalyticsConfiguration).toHaveBeenCalledWith({
            source: {
              '@coveo/atomic': '1.0.0',
            },
          });
          expect(mockDispatch).toHaveBeenCalledWith(
            mockUpdateAnalyticsConfiguration.mock.results[0].value
          );
        });
      }
    );

    it('should update the mobile breakpoint from atomic-search-layout when available', async () => {
      const element = await setupElement({mobileBreakpoint: '768px'});

      await callTestedInitMethod(element);

      expect(element.bindings.store.state.mobileBreakpoint).toBe('768px');
    });

    it('should keep the default mobile breakpoint when no atomic-search-layout exists', async () => {
      const element = await setupElement();

      await callTestedInitMethod(element);

      expect(element.bindings.store.state.mobileBreakpoint).toBe(
        DEFAULT_MOBILE_BREAKPOINT
      );
    });

    it('should initialize search status with #buildSearchStatus', async () => {
      const element = await setupElement();

      await callTestedInitMethod(element);

      expect(buildSearchStatus).toHaveBeenCalledExactlyOnceWith(
        element.engine!
      );
      expect(element.searchStatus).toBe(
        vi.mocked(buildSearchStatus).mock.results[0].value
      );
    });

    it('should subscribe to the search status state updates', async () => {
      const element = await setupElement();
      const subscribe = vi.fn();
      vi.mocked(buildSearchStatus).mockImplementationOnce(() => ({
        ...buildFakeSearchStatus(),
        subscribe,
      }));

      await callTestedInitMethod(element);

      expect(subscribe).toHaveBeenCalledExactlyOnceWith(expect.any(Function));
    });

    describe('when the search status state changes', () => {
      it('should unset the loading flag when the first search was executed', async () => {
        const element = await setupElement();
        const mockSearchStatus = buildFakeSearchStatus({
          firstSearchExecuted: false,
        });
        const subscribeSpy = vi.spyOn(mockSearchStatus, 'subscribe');
        vi.mocked(buildSearchStatus).mockReturnValue(mockSearchStatus);

        await callTestedInitMethod(element);

        mockSearchStatus.state.firstSearchExecuted = true;
        const searchStatusSubscribeCallback = subscribeSpy.mock.calls[0][0];
        const mockedUnsetLoadingFlag = vi.spyOn(
          element.bindings.store,
          'unsetLoadingFlag'
        );

        searchStatusSubscribeCallback();

        expect(mockedUnsetLoadingFlag).toHaveBeenCalled();
      });
    });
  });

  describe('#fieldsToInclude', () => {
    it('should register fieldsToInclude when the engine is created', async () => {
      const registerFieldsToIncludeMock = vi.fn();
      vi.mocked(loadFieldActions, {partial: true}).mockReturnValue({
        registerFieldsToInclude: registerFieldsToIncludeMock,
      });

      const element = await setupElement({
        fieldsToInclude: ['field1', 'field2'],
      });

      await element.initialize(searchEngineConfig);

      expect(registerFieldsToIncludeMock).toHaveBeenCalledWith(
        expect.arrayContaining(['field1', 'field2'])
      );
    });

    it('should handle string fieldsToInclude attribute by parsing JSON', async () => {
      const element = await setupElement();
      element.setAttribute('fields-to-include', '["field1", "field2"]');
      await element.updateComplete;

      expect(element.fieldsToInclude).toEqual(['field1', 'field2']);
    });

    it('should handle invalid JSON in fieldsToInclude attribute gracefully', async () => {
      const element = await setupElement();
      element.setAttribute('fields-to-include', 'invalid-json');
      await element.updateComplete;

      expect(element.fieldsToInclude).toEqual([]);
    });

    it('should update store fields when fieldsToInclude changes', async () => {
      const element = await setupElement();
      await element.initialize(searchEngineConfig);

      expect(element.bindings.store.state.fieldsToInclude).toEqual(
        expect.arrayContaining(EcommerceDefaultFieldsToInclude)
      );

      const newFields = ['custom_field1', 'custom_field2'];
      element.fieldsToInclude = newFields;
      await element.updateComplete;

      expect(element.bindings.store.state.fieldsToInclude).toEqual([
        ...EcommerceDefaultFieldsToInclude,
        ...newFields,
      ]);
    });

    it('should register updated fields with engine when fieldsToInclude changes', async () => {
      const registerFieldsToIncludeMock = vi.fn();
      vi.mocked(loadFieldActions, {partial: true}).mockReturnValue({
        registerFieldsToInclude: registerFieldsToIncludeMock,
      });

      const element = await setupElement();
      await element.initialize(searchEngineConfig);

      registerFieldsToIncludeMock.mockClear();

      const newFields = ['custom_field1', 'custom_field2'];
      element.fieldsToInclude = newFields;
      await element.updateComplete;

      expect(registerFieldsToIncludeMock).toHaveBeenCalledWith([
        ...EcommerceDefaultFieldsToInclude,
        ...newFields,
      ]);
    });
  });

  describe('#executeFirstRequest', () => {
    let element: AtomicSearchInterface;

    beforeEach(async () => {
      element = await setupElement();
    });

    it('should log an error when called before initialization', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      await element.executeFirstSearch();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'You have to call "initialize" on the atomic-search-interface component before modifying the props or calling other public methods.',
        element
      );
    });

    it('should log an error when called before initialization finishes', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      element.engine = buildFakeSearchEngine({});

      await element.executeFirstSearch();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'You have to wait until the "initialize" promise is fulfilled before executing a search.',
        element
      );
    });

    it('should call executeFirstSearch', async () => {
      const mockSearch = buildFakeSearchEngine({
        implementation: {
          executeFirstSearch: vi.fn(),
        },
      });
      vi.mocked(buildSearchEngine).mockReturnValue(mockSearch);
      await element.initialize(searchEngineConfig);

      await element.executeFirstSearch();

      expect(mockSearch.executeFirstSearch).toHaveBeenCalledOnce();
    });

    it('should not dispatch an updateQuery action when standalone search box data does not exist', async () => {
      const element = await setupElement();
      const updateQueryMock = vi.fn();
      vi.mocked(loadQueryActions).mockReturnValue({
        updateQuery: updateQueryMock,
      });

      await element.initialize(searchEngineConfig);

      await element.executeFirstSearch();

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
        await element.initialize(searchEngineConfig);

        await element.executeFirstSearch();

        expect(removeItemSpy).toHaveBeenCalledExactlyOnceWith(
          StorageItems.STANDALONE_SEARCH_BOX_DATA
        );
      });

      it('should dispatch an updateQuery action with the new query', async () => {
        const updateQueryMock = vi.fn();
        vi.mocked(loadQueryActions).mockReturnValue({
          updateQuery: updateQueryMock,
        });
        await element.initialize(searchEngineConfig);

        await element.executeFirstSearch();

        expect(updateQueryMock).toHaveBeenCalledExactlyOnceWith({
          enableQuerySyntax: undefined,
          q: 'test query',
        });
      });
    });
  });

  // #toggleAnalytics
  it('should call InterfaceController.onAnalyticsChange when the analytics attribute changes', async () => {
    const element = await setupElement();
    await element.initialize(searchEngineConfig);
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
    await element.initialize(searchEngineConfig);

    expect(element.bindings.store.state.iconAssetsPath).not.toBe(
      '/new/icon/assets/path'
    );

    element.iconAssetsPath = '/new/icon/assets/path';
    await element.updateComplete;

    expect(element.bindings.store.state.iconAssetsPath).toBe(
      '/new/icon/assets/path'
    );
  });

  // #updateSearchHub
  describe('when the searchHub attribute changes', () => {
    it('should do nothing when the engine has not been created', async () => {
      const element = await setupElement({searchHub: 'test-hub'});
      const updateSearchConfigurationMock = vi.fn();
      vi.mocked(loadSearchConfigurationActions).mockReturnValue({
        updateSearchConfiguration: updateSearchConfigurationMock,
      });

      element.searchHub = 'new-hub';
      await element.updateComplete;

      expect(updateSearchConfigurationMock).not.toHaveBeenCalled();
    });

    it('should dispatch updateSearchConfiguration when the engine has been created', async () => {
      const element = await setupElement({searchHub: 'test-hub'});
      const updateSearchConfigurationMock = vi.fn();
      vi.mocked(loadSearchConfigurationActions).mockReturnValue({
        updateSearchConfiguration: updateSearchConfigurationMock,
      });
      await element.initialize(searchEngineConfig);

      updateSearchConfigurationMock.mockClear();

      element.searchHub = 'new-hub';
      await element.updateComplete;

      expect(updateSearchConfigurationMock).toHaveBeenCalledWith({
        searchHub: 'new-hub',
      });
    });

    it('should do nothing when the new searchHub value is the same as the current engine state', async () => {
      const element = await setupElement({searchHub: 'test-hub'});
      const fakeEngine = buildFakeSearchEngine({
        state: {searchHub: 'test-hub'},
      });
      vi.mocked(buildSearchEngine).mockReturnValue(fakeEngine);
      const updateSearchConfigurationMock = vi.fn();
      vi.mocked(loadSearchConfigurationActions).mockReturnValue({
        updateSearchConfiguration: updateSearchConfigurationMock,
      });
      await element.initialize(searchEngineConfig);

      updateSearchConfigurationMock.mockClear();

      element.searchHub = 'test-hub';
      await element.updateComplete;

      expect(updateSearchConfigurationMock).not.toHaveBeenCalled();
    });
  });

  // #updatePipeline
  describe('when the pipeline attribute changes', () => {
    it('should do nothing when the engine has not been created', async () => {
      const element = await setupElement({pipeline: 'test-pipeline'});
      const updateSearchConfigurationMock = vi.fn();
      vi.mocked(loadSearchConfigurationActions).mockReturnValue({
        updateSearchConfiguration: updateSearchConfigurationMock,
      });

      element.pipeline = 'new-pipeline';
      await element.updateComplete;

      expect(updateSearchConfigurationMock).not.toHaveBeenCalled();
    });

    it('should dispatch updateSearchConfiguration when the engine has been created', async () => {
      const element = await setupElement({pipeline: 'test-pipeline'});
      const updateSearchConfigurationMock = vi.fn();
      vi.mocked(loadSearchConfigurationActions).mockReturnValue({
        updateSearchConfiguration: updateSearchConfigurationMock,
      });
      await element.initialize(searchEngineConfig);

      updateSearchConfigurationMock.mockClear();

      element.pipeline = 'new-pipeline';
      await element.updateComplete;

      expect(updateSearchConfigurationMock).toHaveBeenCalledWith({
        pipeline: 'new-pipeline',
      });
    });

    it('should do nothing when the new pipeline value is the same as the current engine state', async () => {
      const element = await setupElement({pipeline: 'test-pipeline'});
      const fakeEngine = buildFakeSearchEngine({
        state: {pipeline: 'test-pipeline'},
      });
      vi.mocked(buildSearchEngine).mockReturnValue(fakeEngine);
      const updateSearchConfigurationMock = vi.fn();
      vi.mocked(loadSearchConfigurationActions).mockReturnValue({
        updateSearchConfiguration: updateSearchConfigurationMock,
      });
      await element.initialize(searchEngineConfig);

      updateSearchConfigurationMock.mockClear();

      element.pipeline = 'test-pipeline';
      await element.updateComplete;

      expect(updateSearchConfigurationMock).not.toHaveBeenCalled();
    });
  });

  // #updateLanguage
  describe('when the language attribute changes', () => {
    it('should do nothing when the engine has not been created', async () => {
      const onLanguageChangeSpy = vi.spyOn(
        InterfaceController.prototype,
        'onLanguageChange'
      );
      const element = await setupElement({language: 'en'});

      element.language = 'fr';
      await element.updateComplete;

      expect(onLanguageChangeSpy).not.toHaveBeenCalled();
    });

    it('should do nothing when the new language attribute is undefined', async () => {
      const onLanguageChangeSpy = vi.spyOn(
        InterfaceController.prototype,
        'onLanguageChange'
      );
      const element = await setupElement({language: 'en'});

      // @ts-ignore setting to undefined to simulate removing the attribute
      element.language = undefined;
      await element.updateComplete;

      expect(onLanguageChangeSpy).not.toHaveBeenCalled();
    });
    describe('when the engine has been created & the language attribute is defined & the context is defined', () => {
      it('should call InterfaceController.onLanguageChange with no argument', async () => {
        const onLanguageChangeSpy = vi.spyOn(
          InterfaceController.prototype,
          'onLanguageChange'
        );
        const element = await setupElement({language: 'en'});
        await element.initialize(searchEngineConfig);
        await element.updateComplete;
        onLanguageChangeSpy.mockClear();

        element.language = 'fr';
        await element.updateComplete;

        expect(onLanguageChangeSpy).toHaveBeenCalledExactlyOnceWith();
      });
    });
  });

  describe('#disconnectedCallback (when removed from the DOM)', () => {
    it('should remove aria-live element', async () => {
      const element = await setupElement();
      await element.initialize(searchEngineConfig);

      expect(element.querySelector('atomic-aria-live')).toBeTruthy();

      element.remove();

      expect(element.querySelector('atomic-aria-live')).toBeFalsy();
    });

    it('should unsubscribe from urlManager state updates when subscribed', async () => {
      const element = await setupElement({
        reflectStateInUrl: true,
        disableStateReflectionInUrl: false,
      });
      const unsubscribeMock = vi.fn();
      vi.mocked(buildUrlManager).mockReturnValue({
        ...mockUrlManager,
        subscribe: vi.fn(() => unsubscribeMock),
      });

      await element.initialize(searchEngineConfig);

      element.remove();

      expect(unsubscribeMock).toHaveBeenCalled();
    });

    it('should unsubscribe from search status state updates when subscribed', async () => {
      const element = await setupElement();
      const unsubscribeMock = vi.fn();
      const mockSearchStatus = buildFakeSearchStatus();
      mockSearchStatus.subscribe = vi.fn(() => unsubscribeMock);
      vi.mocked(buildSearchStatus).mockReturnValue(mockSearchStatus);

      await element.initialize(searchEngineConfig);

      element.remove();

      expect(unsubscribeMock).toHaveBeenCalled();
    });

    it('should remove the hashchange event listener on the window object', async () => {
      const element = await setupElement({
        reflectStateInUrl: true,
        disableStateReflectionInUrl: false,
      });
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      await element.initialize(searchEngineConfig);

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

    describe('when relevance inspector is enabled', () => {
      it('should render the relevance inspector when engine is available and enableRelevanceInspector is true', async () => {
        const element = await setupElement({enableRelevanceInspector: true});
        await element.initialize(searchEngineConfig);

        expect(
          element.shadowRoot?.querySelector('atomic-relevance-inspector')
        ).toBeTruthy();
      });

      it('should not render the relevance inspector when disableRelevanceInspector is true', async () => {
        const element = await setupElement({disableRelevanceInspector: true});
        await element.initialize(searchEngineConfig);

        expect(
          element.shadowRoot?.querySelector('atomic-relevance-inspector')
        ).toBeFalsy();
      });

      it('should not render the relevance inspector when enableRelevanceInspector is false', async () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        const element = await setupElement({enableRelevanceInspector: false});
        await element.initialize(searchEngineConfig);

        expect(
          element.shadowRoot?.querySelector('atomic-relevance-inspector')
        ).toBeFalsy();
      });

      it('should not render the relevance inspector when engine is not available', async () => {
        const element = await setupElement({enableRelevanceInspector: true});

        expect(
          element.shadowRoot?.querySelector('atomic-relevance-inspector')
        ).toBeFalsy();
      });
    });
  });
});
