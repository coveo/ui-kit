import * as headless from '@coveo/headless';
import i18next from 'i18next';
import {html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import {within} from 'shadow-dom-testing-library';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {
  AtomicSearchInterface,
  type Bindings,
} from '@/src/components/search/atomic-search-interface/atomic-search-interface';
import {createSearchStore} from '@/src/components/search/atomic-search-interface/store';
import {bindings} from '@/src/decorators/bindings';
import type {InitializableComponent} from '@/src/decorators/types';
import {markParentAsReady} from '@/src/utils/init-queue';
import {SafeStorage, StorageItems} from '@/src/utils/local-storage-utils';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import {buildFakeSearchStatus} from '@/vitest-utils/testing-helpers/fixtures/headless/search/search-status-controller';
import {buildFakeUrlManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/url-manager-controller';
import {InterfaceController} from '../../common/interface/interface-controller';

vi.mock('i18next', {spy: true});
vi.mock('@coveo/headless', {spy: true});
vi.mock('@/src/components/search/atomic-search-interface/store', {spy: true});
vi.mock('@/src/utils/init-queue', {spy: true});
vi.mock('@/src/utils/local-storage-utils', {spy: true});

@customElement('test-element')
@bindings()
class TestElement
  extends LitElement
  implements InitializableComponent<Bindings>
{
  @state()
  public bindings: Bindings = {} as Bindings;
  @state() public error!: Error;

  public initialize() {}

  public render() {
    return html`test-element`;
  }
}

describe('atomic-search-interface', () => {
  beforeEach(async () => {
    vi.mocked(headless.buildSearchEngine).mockReturnValue(
      buildFakeSearchEngine()
    );

    vi.mocked(headless.buildSearchStatus).mockReturnValue(
      buildFakeSearchStatus()
    );

    vi.mocked(headless.buildUrlManager).mockReturnValue(buildFakeUrlManager());

    vi.mocked(headless.loadFieldActions).mockReturnValue({
      registerFieldsToInclude: vi.fn(),
    } as unknown as ReturnType<typeof headless.loadFieldActions>);

    vi.mocked(headless.loadQueryActions).mockReturnValue({
      updateQuery: vi.fn(),
    } as unknown as ReturnType<typeof headless.loadQueryActions>);

    vi.mocked(headless.loadSearchConfigurationActions).mockReturnValue({
      updateSearchConfiguration: vi.fn(),
    } as unknown as ReturnType<typeof headless.loadSearchConfigurationActions>);

    const mockStore = {
      setLoadingFlag: vi.fn(),
      unsetLoadingFlag: vi.fn(),
      hasLoadingFlag: vi.fn().mockReturnValue(false),
      addFieldsToInclude: vi.fn(),
      state: {
        iconAssetsPath: './assets',
        mobileBreakpoint: '768px',
        fieldsToInclude: [],
      },
    };
    vi.mocked(createSearchStore).mockReturnValue(mockStore as never);

    vi.mocked(SafeStorage).mockImplementation(
      () =>
        ({
          getParsedJSON: vi.fn().mockReturnValue(null),
          removeItem: vi.fn(),
        }) as unknown as SafeStorage
    );
  });

  const setupElement = async ({
    analytics,
    iconAssetsPath,
    language,
    languageAssetsPath,
    logLevel,
    fieldsToInclude,
    pipeline,
    searchHub,
    timezone,
    reflectStateInUrl,
    scrollContainer,
    enableRelevanceInspector,
  }: {
    analytics?: boolean;
    iconAssetsPath?: string;
    language?: string;
    languageAssetsPath?: string;
    logLevel?: string;
    fieldsToInclude?: string[];
    pipeline?: string;
    searchHub?: string;
    timezone?: string;
    reflectStateInUrl?: boolean;
    scrollContainer?: string;
    enableRelevanceInspector?: boolean;
  } = {}) => {
    const fieldsToIncludeJson = fieldsToInclude
      ? JSON.stringify(fieldsToInclude)
      : undefined;
    const element = (await fixture<AtomicSearchInterface>(
      html`<atomic-search-interface
        ?analytics=${analytics}
        icon-assets-path=${ifDefined(iconAssetsPath)}
        language=${ifDefined(language)}
        language-assets-path=${ifDefined(languageAssetsPath)}
        log-level=${ifDefined(logLevel)}
        fields-to-include=${ifDefined(fieldsToIncludeJson)}
        pipeline=${ifDefined(pipeline)}
        search-hub=${ifDefined(searchHub)}
        timezone=${ifDefined(timezone)}
        ?reflect-state-in-url=${reflectStateInUrl}
        scroll-container=${ifDefined(scrollContainer)}
        ?enable-relevance-inspector=${enableRelevanceInspector}
      >
      </atomic-search-interface>`
    )) as AtomicSearchInterface;

    expect(element).toBeInstanceOf(AtomicSearchInterface);
    return element;
  };

  const addChildElement = async <T extends TestElement>(
    element: AtomicSearchInterface,
    tag = 'test-element'
  ) => {
    const childElement = document.createElement(
      tag
    ) as InitializableComponent<Bindings> & T;
    element.appendChild(childElement);

    await childElement.updateComplete;
    expect(childElement).toBeInstanceOf(TestElement);

    return childElement;
  };

  // #constructor
  describe('when created', () => {
    it('should create an instance of InterfaceController', async () => {
      const element = await setupElement();

      expect(
        (
          element as unknown as {
            interfaceController: InterfaceController<never>;
          }
        ).interfaceController
      ).toBeInstanceOf(InterfaceController);
    });

    it('should set #store to the value returned by createSearchStore', async () => {
      const createSearchStoreSpy = vi.mocked(createSearchStore);
      const element = await setupElement();
      const engine = buildFakeSearchEngine();

      await element.initializeWithSearchEngine(engine);

      expect(createSearchStoreSpy).toHaveBeenCalledOnce();
      expect(element.bindings.store).toBeDefined();
      expect(element.bindings.store).toBe(
        createSearchStoreSpy.mock.results[0].value
      );
    });

    it('should set i18n to the value returned by i18next.createInstance', async () => {
      const i18nextCreateInstanceSpy = vi.mocked(i18next.createInstance);

      const element = await setupElement();

      expect(i18nextCreateInstanceSpy).toHaveBeenCalledOnce();
      expect(element.i18n).toBeDefined();
      expect(element.i18n).toBe(i18nextCreateInstanceSpy.mock.results[0].value);
    });

    it('should set default property values', async () => {
      const element = await setupElement();

      expect(element.analytics).toBe(true);
      expect(element.language).toBe('en');
      expect(element.languageAssetsPath).toBe('./lang');
      expect(element.iconAssetsPath).toBe('./assets');
      expect(element.reflectStateInUrl).toBe(true);
      expect(element.scrollContainer).toBe('atomic-search-interface');
      expect(element.enableRelevanceInspector).toBe(true);
      expect(element.fieldsToInclude).toEqual([]);
    });
  });

  // #connectedCallback
  describe('when added to the DOM', () => {
    it('should set the loading flag for first search executed', async () => {
      const element = await setupElement();

      expect(element).toBeInstanceOf(AtomicSearchInterface);
    });

    it("should cause InterfaceController.onComponentInitializing to be called when an 'atomic/initializeComponent' event is dispatched", async () => {
      const element = await setupElement();
      const onComponentInitializingSpy = vi.spyOn(
        InterfaceController.prototype,
        'onComponentInitializing'
      );
      const event = new CustomEvent('atomic/initializeComponent');

      element.dispatchEvent(event);

      expect(onComponentInitializingSpy).toHaveBeenCalledExactlyOnceWith(event);
    });

    it('should update mobile breakpoint from atomic-search-layout child', async () => {
      const element = await setupElement();
      const searchLayout = document.createElement('atomic-search-layout');
      searchLayout.mobileBreakpoint = '768px';
      element.appendChild(searchLayout);

      expect(element).toBeInstanceOf(AtomicSearchInterface);
    });

    it('should initialize relevance inspector when enableRelevanceInspector is true', async () => {
      const element = await setupElement({enableRelevanceInspector: true});
      const addEventListenerSpy = vi.spyOn(element, 'addEventListener');

      element.connectedCallback();

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'dblclick',
        expect.any(Function)
      );
    });
  });

  // #initialize
  describe('#initialize', () => {
    it('should call buildSearchEngine with the provided options', async () => {
      const buildSearchEngineSpy = vi.mocked(headless.buildSearchEngine);
      const element = await setupElement();
      const options = {
        accessToken: 'test-token',
        organizationId: 'test-org',
      };

      await element.initialize(options);

      expect(buildSearchEngineSpy).toHaveBeenCalledExactlyOnceWith({
        configuration: {
          ...options,
          search: {
            searchHub: 'default',
            pipeline: undefined,
            locale: 'en',
            timezone: undefined,
          },
          analytics: expect.any(Object),
        },
        loggerOptions: {
          level: undefined,
        },
      });
    });

    it('should set bindings after initialization', async () => {
      const element = await setupElement();
      const options = {
        accessToken: 'test-token',
        organizationId: 'test-org',
      };

      expect(element.bindings.engine).toBeUndefined();

      await element.initialize(options);

      expect(element.bindings.engine).toBeDefined();
      expect(element.bindings.i18n).toBe(element.i18n);
      expect(element.bindings.store).toBeDefined();
      expect(element.bindings.interfaceElement).toBe(element);
    });

    it('should call markParentAsReady with this', async () => {
      const markParentAsReadySpy = vi.mocked(markParentAsReady);
      const element = await setupElement();
      const options = {
        accessToken: 'test-token',
        organizationId: 'test-org',
      };

      expect(markParentAsReadySpy).not.toHaveBeenCalled();

      await element.initialize(options);

      expect(markParentAsReadySpy).toHaveBeenCalledExactlyOnceWith(element);
    });

    it('should initialize URL manager when reflectStateInUrl is true', async () => {
      const buildUrlManagerSpy = vi.mocked(headless.buildUrlManager);
      const element = await setupElement({reflectStateInUrl: true});
      const options = {
        accessToken: 'test-token',
        organizationId: 'test-org',
      };

      await element.initialize(options);

      expect(buildUrlManagerSpy).toHaveBeenCalledExactlyOnceWith(
        element.engine,
        {
          initialState: {fragment: ''},
        }
      );
    });

    it('should register fields to include when fieldsToInclude is not empty', async () => {
      const element = await setupElement({
        fieldsToInclude: ['field1', 'field2'],
      });
      const options = {
        accessToken: 'test-token',
        organizationId: 'test-org',
      };

      await element.initialize(options);

      expect(element.fieldsToInclude).toEqual(['field1', 'field2']);
    });

    it('should add aria-live element if not present', async () => {
      const element = await setupElement();
      const options = {
        accessToken: 'test-token',
        organizationId: 'test-org',
      };

      await element.initialize(options);

      expect(element.querySelector('atomic-aria-live')).toBeTruthy();
    });

    it('should not add aria-live element if already present', async () => {
      const element = await setupElement();
      const existingAriaLive = document.createElement('atomic-aria-live');
      element.appendChild(existingAriaLive);

      const initialCount = element.querySelectorAll('atomic-aria-live').length;

      const options = {
        accessToken: 'test-token',
        organizationId: 'test-org',
      };

      await element.initialize(options);

      expect(
        element.querySelectorAll('atomic-aria-live').length
      ).toBeGreaterThanOrEqual(initialCount);
    });

    it('should merge search configuration with provided options', async () => {
      const buildSearchEngineSpy = vi.mocked(headless.buildSearchEngine);
      const element = await setupElement({
        pipeline: 'my-pipeline',
        searchHub: 'my-hub',
        timezone: 'America/Montreal',
      });
      const options = {
        accessToken: 'test-token',
        organizationId: 'test-org',
        search: {
          pipeline: 'override-pipeline',
        },
      };

      await element.initialize(options);

      expect(buildSearchEngineSpy).toHaveBeenCalledWith({
        configuration: {
          ...options,
          search: {
            searchHub: 'my-hub',
            pipeline: 'override-pipeline',
            locale: 'en',
            timezone: 'America/Montreal',
          },
          analytics: expect.any(Object),
        },
        loggerOptions: {
          level: undefined,
        },
      });
    });
  });

  // #initializeWithSearchEngine
  describe('#initializeWithSearchEngine', () => {
    it('should set the engine directly without building a new one', async () => {
      const element = await setupElement();
      const engine = buildFakeSearchEngine({});

      expect(element.engine).toBeUndefined();

      await element.initializeWithSearchEngine(engine);

      expect(element.engine).toBe(engine);
    });

    it('should set bindings after initialization with provided engine', async () => {
      const element = await setupElement();
      const engine = buildFakeSearchEngine({});

      expect(element.bindings.engine).toBeUndefined();

      await element.initializeWithSearchEngine(engine);

      expect(element.bindings.engine).toBe(engine);
      expect(element.bindings.i18n).toBe(element.i18n);
      expect(element.bindings.store).toBeDefined();
      expect(element.bindings.interfaceElement).toBe(element);
    });

    it('should warn when pipeline mismatch occurs', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const element = await setupElement({pipeline: 'my-pipeline'});
      const engine = buildFakeSearchEngine({
        state: {
          ...buildFakeSearchEngine().state,
          pipeline: 'different-pipeline',
          searchHub: 'default',
        },
      });

      await element.initializeWithSearchEngine(engine);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Mismatch between search interface pipeline and engine pipeline. The engine pipeline will be used.'
      );
    });

    it('should warn when searchHub mismatch occurs', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const element = await setupElement({searchHub: 'my-hub'});
      const engine = buildFakeSearchEngine({
        state: {
          ...buildFakeSearchEngine().state,
          pipeline: 'default',
          searchHub: 'different-hub',
        },
      });

      await element.initializeWithSearchEngine(engine);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Mismatch between search interface search hub and engine search hub. The engine search hub will be used.'
      );
    });
  });

  // #executeFirstSearch
  describe('#executeFirstSearch', () => {
    it('should do nothing when engine is not created', async () => {
      const element = await setupElement();

      await element.executeFirstSearch();

      // Should not throw or cause any issues
    });

    it('should log error when not initialized', async () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const element = await setupElement();
      const engine = buildFakeSearchEngine({});
      element.engine = engine;

      await element.executeFirstSearch();

      expect(consoleSpy).toHaveBeenCalledExactlyOnceWith(
        'You have to wait until the "initialize" promise is fulfilled before executing a search.',
        element
      );
    });

    it('should call engine.executeFirstSearch when properly initialized', async () => {
      const element = await setupElement();
      const engine = buildFakeSearchEngine({});
      const executeFirstSearchSpy = vi.spyOn(engine, 'executeFirstSearch');

      await element.initializeWithSearchEngine(engine);
      await element.executeFirstSearch();

      expect(executeFirstSearchSpy).toHaveBeenCalledOnce();
    });

    it('should handle standalone search box data when present', async () => {
      const standaloneData = {
        value: 'test query',
        enableQuerySyntax: true,
        analytics: {origin: {level1: 'searchbox'}},
      };

      const mockStorage = {
        getParsedJSON: vi.fn().mockReturnValue(standaloneData),
        removeItem: vi.fn(),
      };
      vi.mocked(SafeStorage).mockImplementation(() => mockStorage as never);

      const element = await setupElement();
      const engine = buildFakeSearchEngine({});
      const updateQueryMock = vi.fn();
      vi.mocked(headless.loadQueryActions).mockReturnValue({
        updateQuery: updateQueryMock,
      } as never);

      await element.initializeWithSearchEngine(engine);
      await element.executeFirstSearch();

      expect(mockStorage.getParsedJSON).toHaveBeenCalledWith(
        StorageItems.STANDALONE_SEARCH_BOX_DATA,
        null
      );
      expect(mockStorage.removeItem).toHaveBeenCalledWith(
        StorageItems.STANDALONE_SEARCH_BOX_DATA
      );
      expect(updateQueryMock).toHaveBeenCalledWith({
        q: 'test query',
        enableQuerySyntax: true,
      });
    });
  });

  // Property watchers
  describe('property watchers', () => {
    // #toggleAnalytics
    describe('when analytics prop changes', () => {
      it('should call InterfaceController.onAnalyticsChange', async () => {
        const element = await setupElement();
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
    });

    // #updateLanguage
    describe('when language prop changes', () => {
      it('should call InterfaceController.onLanguageChange when engine is created', async () => {
        const element = await setupElement();
        const engine = buildFakeSearchEngine({});
        await element.initializeWithSearchEngine(engine);

        const onLanguageChangeSpy = vi.spyOn(
          InterfaceController.prototype,
          'onLanguageChange'
        );

        expect(onLanguageChangeSpy).not.toHaveBeenCalled();

        element.language = 'fr';
        await element.updateComplete;

        expect(onLanguageChangeSpy).toHaveBeenCalledOnce();
      });

      it('should update search configuration when language changes', async () => {
        const updateSearchConfigurationMock = vi.fn();
        vi.mocked(headless.loadSearchConfigurationActions).mockReturnValue({
          updateSearchConfiguration: updateSearchConfigurationMock,
        } as never);

        const element = await setupElement();
        const engine = buildFakeSearchEngine({});
        await element.initializeWithSearchEngine(engine);

        element.language = 'fr';
        await element.updateComplete;

        expect(updateSearchConfigurationMock).toHaveBeenCalledWith({
          locale: 'fr',
        });
      });

      it('should not update when engine is not created', async () => {
        const element = await setupElement();
        const onLanguageChangeSpy = vi.spyOn(
          InterfaceController.prototype,
          'onLanguageChange'
        );

        element.language = 'fr';
        await element.updateComplete;

        expect(onLanguageChangeSpy).not.toHaveBeenCalled();
      });
    });

    // #updateIconAssetsPath
    describe('when iconAssetsPath prop changes', () => {
      it('should update the iconAssetsPath property', async () => {
        const element = await setupElement();

        element.iconAssetsPath = '/new/icon/assets/path';
        await element.updateComplete;

        expect(element.iconAssetsPath).toBe('/new/icon/assets/path');
      });
    });

    // #updateSearchHub
    describe('when searchHub prop changes', () => {
      it('should update search configuration when engine exists', async () => {
        const updateSearchConfigurationMock = vi.fn();
        vi.mocked(headless.loadSearchConfigurationActions).mockReturnValue({
          updateSearchConfiguration: updateSearchConfigurationMock,
        } as never);

        const element = await setupElement();
        const engine = buildFakeSearchEngine({});
        await element.initializeWithSearchEngine(engine);

        element.searchHub = 'new-hub';
        await element.updateComplete;

        expect(updateSearchConfigurationMock).toHaveBeenCalledWith({
          searchHub: 'new-hub',
        });
      });

      it('should use default when searchHub is undefined', async () => {
        const element = await setupElement();
        const engine = buildFakeSearchEngine({});
        await element.initializeWithSearchEngine(engine);

        element.searchHub = undefined;
        await element.updateComplete;

        expect(element.searchHub).toBeUndefined();
      });
    });

    // #updatePipeline
    describe('when pipeline prop changes', () => {
      it('should update search configuration when engine exists', async () => {
        const updateSearchConfigurationMock = vi.fn();
        vi.mocked(headless.loadSearchConfigurationActions).mockReturnValue({
          updateSearchConfiguration: updateSearchConfigurationMock,
        } as never);

        const element = await setupElement();
        const engine = buildFakeSearchEngine({});
        await element.initializeWithSearchEngine(engine);

        element.pipeline = 'new-pipeline';
        await element.updateComplete;

        expect(updateSearchConfigurationMock).toHaveBeenCalledWith({
          pipeline: 'new-pipeline',
        });
      });
    });
  });

  // #scrollToTop
  describe('#scrollToTop', () => {
    it('should scroll container into view when found', async () => {
      const element = await setupElement();
      const mockContainer = document.createElement('div');
      mockContainer.scrollIntoView = vi.fn();
      vi.spyOn(document, 'querySelector').mockReturnValue(mockContainer);

      element.scrollToTop();

      expect(document.querySelector).toHaveBeenCalledWith(
        'atomic-search-interface'
      );
      expect(mockContainer.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
      });
    });

    it('should warn when container not found', async () => {
      const element = await setupElement({scrollContainer: 'non-existent'});
      const engine = buildFakeSearchEngine({});
      await element.initializeWithSearchEngine(engine);

      vi.spyOn(document, 'querySelector').mockReturnValue(null);

      element.scrollToTop();

      expect(engine.logger.warn).toHaveBeenCalledWith(
        'Could not find the scroll container with the selector "non-existent". This will prevent UX interactions that require a scroll from working correctly. Please check the CSS selector in the scrollContainer option'
      );
    });
  });

  // #closeRelevanceInspector
  describe('#closeRelevanceInspector', () => {
    it('should set relevanceInspectorIsOpen to false', async () => {
      const element = await setupElement();
      (
        element as unknown as {relevanceInspectorIsOpen: boolean}
      ).relevanceInspectorIsOpen = true;

      element.closeRelevanceInspector();

      expect(
        (element as unknown as {relevanceInspectorIsOpen: boolean})
          .relevanceInspectorIsOpen
      ).toBe(false);
    });
  });

  // #disconnectedCallback
  describe('when removed from the DOM', () => {
    it('should remove event listeners', async () => {
      const element = await setupElement();
      const removeEventListenerSpy = vi.spyOn(element, 'removeEventListener');

      element.remove();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'atomic/initializeComponent',
        expect.any(Function)
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'atomic/scrollToTop',
        expect.any(Function)
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'atomic/relevanceInspector/close',
        expect.any(Function)
      );
    });

    it('should unsubscribe from URL manager', async () => {
      const unsubscribeSpy = vi.fn();
      vi.mocked(headless.buildUrlManager).mockReturnValue({
        ...buildFakeUrlManager({}),
        subscribe: vi.fn().mockReturnValue(unsubscribeSpy),
      });

      const element = await setupElement();
      await element.initialize({
        accessToken: 'test-token',
        organizationId: 'test-org',
      });

      element.remove();

      expect(unsubscribeSpy).toHaveBeenCalled();
    });

    it('should unsubscribe from search status', async () => {
      const unsubscribeSpy = vi.fn();
      vi.mocked(headless.buildSearchStatus).mockReturnValue({
        ...buildFakeSearchStatus({}),
        subscribe: vi.fn().mockReturnValue(unsubscribeSpy),
      });

      const element = await setupElement();
      await element.initialize({
        accessToken: 'test-token',
        organizationId: 'test-org',
      });

      element.remove();

      expect(unsubscribeSpy).toHaveBeenCalled();
    });
  });

  // #render
  describe('render', () => {
    it('should render slot for children', async () => {
      const element = await setupElement();
      const engine = buildFakeSearchEngine({});

      await element.initializeWithSearchEngine(engine);
      await element.updateComplete;

      expect(element.shadowRoot?.querySelector('slot')).toBeTruthy();
    });

    it('should render relevance inspector when engine exists and enableRelevanceInspector is true', async () => {
      const element = await setupElement({enableRelevanceInspector: true});
      const engine = buildFakeSearchEngine({});

      await element.initializeWithSearchEngine(engine);
      await element.updateComplete;

      expect(
        element.shadowRoot?.querySelector('atomic-relevance-inspector')
      ).toBeTruthy();
    });

    it('should not render relevance inspector when enableRelevanceInspector is false', async () => {
      const element = await setupElement({enableRelevanceInspector: false});
      const engine = buildFakeSearchEngine({});

      await element.initializeWithSearchEngine(engine);
      await element.updateComplete;

      const inspector = element.shadowRoot?.querySelector(
        'atomic-relevance-inspector'
      );
      expect(inspector?.getAttribute('open')).toBeFalsy();
    });

    it('should render its children', async () => {
      const element = await setupElement();
      const engine = buildFakeSearchEngine({});

      await element.initializeWithSearchEngine(engine);
      await addChildElement(element);
      await element.updateComplete;

      expect(within(element).queryByShadowText('test-element')).toBeTruthy();
    });
  });

  // Error handling
  describe('error handling', () => {
    it('should set error property when engine initialization fails', async () => {
      vi.mocked(headless.buildSearchEngine).mockImplementation(() => {
        throw new Error('Engine initialization failed');
      });

      const element = await setupElement();
      const options = {
        accessToken: 'test-token',
        organizationId: 'test-org',
      };

      await expect(element.initialize(options)).rejects.toThrow(
        'Engine initialization failed'
      );
      expect(element.error).toBeInstanceOf(Error);
      expect(element.error.message).toBe('Engine initialization failed');
    });
  });

  // Bindings integration
  describe('bindings integration', () => {
    it('should provide bindings to its children', async () => {
      const element = await setupElement();
      const childElement = await addChildElement(element);
      const engine = buildFakeSearchEngine({});

      await element.initializeWithSearchEngine(engine);

      expect(childElement.bindings).toBe(element.bindings);
    });

    it('should provide createStyleElement function in bindings', async () => {
      const element = await setupElement();
      const engine = buildFakeSearchEngine({});

      await element.initializeWithSearchEngine(engine);

      const styleElement = element.bindings.createStyleElement();
      expect(styleElement).toBeInstanceOf(HTMLStyleElement);
      expect(styleElement.tagName).toBe('STYLE');
    });

    it('should provide createScriptElement function in bindings', async () => {
      const element = await setupElement();
      const engine = buildFakeSearchEngine({});

      await element.initializeWithSearchEngine(engine);

      const scriptElement = element.bindings.createScriptElement();
      expect(scriptElement).toBeInstanceOf(HTMLScriptElement);
      expect(scriptElement.tagName).toBe('SCRIPT');
    });
  });

  // Property validation
  describe('property validation', () => {
    it('should handle string array for fieldsToInclude', async () => {
      const element = await setupElement({
        fieldsToInclude: ['field1', 'field2', 'field3'],
      });

      expect(element.fieldsToInclude).toEqual(['field1', 'field2', 'field3']);
    });

    it('should handle different log levels', async () => {
      const element = await setupElement({logLevel: 'warn'});

      expect(element.logLevel).toBe('warn');
    });

    it('should handle custom timezone', async () => {
      const element = await setupElement({timezone: 'America/Montreal'});

      expect(element.timezone).toBe('America/Montreal');
    });

    it('should handle custom scroll container', async () => {
      const element = await setupElement({scrollContainer: '#my-container'});

      expect(element.scrollContainer).toBe('#my-container');
    });
  });

  // Relevance inspector functionality
  describe('relevance inspector functionality', () => {
    it('should toggle relevance inspector on alt+double-click when enabled', async () => {
      const element = await setupElement({enableRelevanceInspector: true});
      const engine = buildFakeSearchEngine({});
      await element.initializeWithSearchEngine(engine);

      element.connectedCallback();

      // Access the private property for testing
      const elementWithInspector = element as unknown as {
        relevanceInspectorIsOpen: boolean;
      };

      expect(elementWithInspector.relevanceInspectorIsOpen).toBe(false);

      elementWithInspector.relevanceInspectorIsOpen = true;
      expect(elementWithInspector.relevanceInspectorIsOpen).toBe(true);

      elementWithInspector.relevanceInspectorIsOpen = false;
      expect(elementWithInspector.relevanceInspectorIsOpen).toBe(false);
    });

    it('should not toggle relevance inspector on double-click without alt key', async () => {
      const element = await setupElement({enableRelevanceInspector: true});
      element.connectedCallback();

      const dblClickEvent = new MouseEvent('dblclick', {altKey: false});
      element.dispatchEvent(dblClickEvent);

      expect(
        (element as unknown as {relevanceInspectorIsOpen: boolean})
          .relevanceInspectorIsOpen
      ).toBe(false);
    });
  });

  // URL management
  describe('URL management', () => {
    it('should replace state for first search when URL manager is active', async () => {
      const replaceStateSpy = vi.spyOn(history, 'replaceState');
      const urlManagerSubscribe = vi.fn();
      vi.mocked(headless.buildUrlManager).mockReturnValue({
        state: {fragment: 'new-fragment'},
        subscribe: urlManagerSubscribe,
        synchronize: vi.fn(),
      });
      vi.mocked(headless.buildSearchStatus).mockReturnValue({
        state: {
          hasResults: true,
          firstSearchExecuted: false,
          hasError: false,
          isLoading: false,
        },
        subscribe: vi.fn(),
      });

      const element = await setupElement({reflectStateInUrl: true});
      await element.initialize({
        accessToken: 'test-token',
        organizationId: 'test-org',
      });

      const urlSubscriberCallback = urlManagerSubscribe.mock.calls[0][0];
      urlSubscriberCallback();

      expect(replaceStateSpy).toHaveBeenCalledWith(
        null,
        document.title,
        '#new-fragment'
      );
    });

    it('should push state for subsequent searches when URL manager is active', async () => {
      const pushStateSpy = vi.spyOn(history, 'pushState');
      const urlManagerSubscribe = vi.fn();
      vi.mocked(headless.buildUrlManager).mockReturnValue({
        state: {fragment: 'new-fragment'},
        subscribe: urlManagerSubscribe,
        synchronize: vi.fn(),
      });
      vi.mocked(headless.buildSearchStatus).mockReturnValue({
        state: {
          hasResults: true,
          firstSearchExecuted: true,
          hasError: false,
          isLoading: false,
        },
        subscribe: vi.fn(),
      });

      const element = await setupElement({reflectStateInUrl: true});
      await element.initialize({
        accessToken: 'test-token',
        organizationId: 'test-org',
      });

      const urlSubscriberCallback = urlManagerSubscribe.mock.calls[0][0];
      urlSubscriberCallback();

      expect(pushStateSpy).toHaveBeenCalledWith(
        null,
        document.title,
        '#new-fragment'
      );
    });
  });
});
