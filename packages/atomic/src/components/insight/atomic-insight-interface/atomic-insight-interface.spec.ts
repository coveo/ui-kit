import * as headless from '@coveo/headless/insight';
import i18next from 'i18next';
import {html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import {within} from 'shadow-dom-testing-library';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {
  AtomicInsightInterface,
  type InsightBindings,
} from '@/src/components/insight/atomic-insight-interface/atomic-insight-interface';
import {createInsightStore} from '@/src/components/insight/atomic-insight-interface/store';
import {bindings} from '@/src/decorators/bindings';
import type {InitializableComponent} from '@/src/decorators/types';
import {markParentAsReady} from '@/src/utils/init-queue';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {buildFakeInsightEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/engine';
import {InterfaceController} from '../../common/interface/interface-controller';

vi.mock('i18next', {spy: true});
vi.mock('@coveo/headless/insight', {spy: true});
vi.mock('@/src/components/insight/atomic-insight-interface/store', {spy: true});
vi.mock('@/src/utils/init-queue', {spy: true});

@customElement('test-element')
@bindings()
class TestElement
  extends LitElement
  implements InitializableComponent<InsightBindings>
{
  @state()
  public bindings: InsightBindings = {} as InsightBindings;
  @state() public error!: Error;

  public initialize() {}

  public render() {
    return html`test-element`;
  }
}

describe('atomic-insight-interface', () => {
  beforeEach(async () => {
    vi.mocked(headless.buildInsightEngine).mockReturnValue(
      buildFakeInsightEngine({})
    );

    vi.mocked(headless.loadFieldActions).mockReturnValue({
      registerFieldsToInclude: vi.fn(),
    } as unknown as ReturnType<typeof headless.loadFieldActions>);

    vi.mocked(headless.buildResultsPerPage).mockReturnValue({} as never);
  });

  const setupElement = async ({
    analytics,
    iconAssetsPath,
    language,
    languageAssetsPath,
    logLevel,
    fieldsToInclude,
    resultsPerPage,
  }: {
    analytics?: boolean;
    iconAssetsPath?: string;
    language?: string;
    languageAssetsPath?: string;
    logLevel?: string;
    fieldsToInclude?: string[];
    resultsPerPage?: number;
  } = {}) => {
    const fieldsToIncludeJson = fieldsToInclude
      ? JSON.stringify(fieldsToInclude)
      : undefined;
    const element = (await fixture<AtomicInsightInterface>(
      html`<atomic-insight-interface
        ?analytics=${analytics}
        icon-assets-path=${ifDefined(iconAssetsPath)}
        language=${ifDefined(language)}
        language-assets-path=${ifDefined(languageAssetsPath)}
        log-level=${ifDefined(logLevel)}
        fields-to-include=${ifDefined(fieldsToIncludeJson)}
        results-per-page=${ifDefined(resultsPerPage)}
      >
      </atomic-insight-interface>`
    )) as AtomicInsightInterface;

    expect(element).toBeInstanceOf(AtomicInsightInterface);
    return element;
  };

  const addChildElement = async <T extends TestElement>(
    element: AtomicInsightInterface,
    tag = 'test-element'
  ) => {
    const childElement = document.createElement(
      tag
    ) as InitializableComponent<InsightBindings> & T;
    element.appendChild(childElement);

    await childElement.updateComplete;
    expect(childElement).toBeInstanceOf(TestElement);

    return childElement;
  };

  // #constructor
  describe('when created', () => {
    it('should create an instance of InterfaceController', async () => {
      const element = await setupElement();

      // Mocking the InterfaceController class would be complex.
      expect(
        (
          element as unknown as {
            interfaceController: InterfaceController<never>;
          }
        ).interfaceController
      ).toBeInstanceOf(InterfaceController);
    });

    it('should set #store to the value returned by createInsightStore', async () => {
      const createInsightStoreSpy = vi.mocked(createInsightStore);

      const element = await setupElement();

      expect(createInsightStoreSpy).toHaveBeenCalledOnce();
      expect(element.store).toBeDefined();
      expect(element.store).toBe(createInsightStoreSpy.mock.results[0].value);
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
      expect(element.resultsPerPage).toBe(5);
      expect(element.fieldsToInclude).toEqual([]);
    });
  });

  // #connectedCallback
  describe('when added to the DOM', () => {
    it('should set the loading flag for first insight request', async () => {
      const element = await setupElement();
      const setLoadingFlagSpy = vi.spyOn(element.store, 'setLoadingFlag');

      element.connectedCallback();

      expect(setLoadingFlagSpy).toHaveBeenCalledExactlyOnceWith(
        'firstInsightRequestExecuted'
      );
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
  });

  // #initialize
  describe('#initialize', () => {
    it('should call initEngine with the provided options', async () => {
      const element = await setupElement();
      const initEngineSpy = vi.spyOn(
        element as unknown as {initEngine: (options: unknown) => void},
        'initEngine'
      );
      const options = {
        accessToken: 'test-token',
        organizationId: 'test-org',
      };

      await element.initialize(options);

      expect(initEngineSpy).toHaveBeenCalledExactlyOnceWith(options);
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
      expect(element.bindings.store).toBe(element.store);
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

    it('should unset the loading flag after initialization', async () => {
      const element = await setupElement();
      const unsetLoadingFlagSpy = vi.spyOn(element.store, 'unsetLoadingFlag');
      const options = {
        accessToken: 'test-token',
        organizationId: 'test-org',
      };

      await element.initialize(options);

      expect(unsetLoadingFlagSpy).toHaveBeenCalledExactlyOnceWith(
        'firstInsightRequestExecuted'
      );
    });

    it('should initialize results per page controller', async () => {
      const buildResultsPerPageSpy = vi.mocked(headless.buildResultsPerPage);
      const element = await setupElement({resultsPerPage: 10});
      const options = {
        accessToken: 'test-token',
        organizationId: 'test-org',
      };

      await element.initialize(options);

      expect(buildResultsPerPageSpy).toHaveBeenCalledExactlyOnceWith(
        element.engine,
        {
          initialState: {numberOfResults: 10},
        }
      );
    });

    it('should register fields to include when fieldsToInclude is not empty', async () => {
      const registerFieldsToIncludeMock = vi.fn();
      vi.mocked(headless.loadFieldActions).mockReturnValue({
        registerFieldsToInclude: registerFieldsToIncludeMock,
      } as unknown as ReturnType<typeof headless.loadFieldActions>);

      const element = await setupElement({
        fieldsToInclude: ['field1', 'field2'],
      });
      const options = {
        accessToken: 'test-token',
        organizationId: 'test-org',
      };

      await element.initialize(options);

      expect(registerFieldsToIncludeMock).toHaveBeenCalledWith([
        'field1',
        'field2',
      ]);
    });

    it('should not register fields to include when fieldsToInclude is empty', async () => {
      const registerFieldsToIncludeMock = vi.fn();
      vi.mocked(headless.loadFieldActions).mockReturnValue({
        registerFieldsToInclude: registerFieldsToIncludeMock,
      } as unknown as ReturnType<typeof headless.loadFieldActions>);

      const element = await setupElement({fieldsToInclude: []});
      const options = {
        accessToken: 'test-token',
        organizationId: 'test-org',
      };

      await element.initialize(options);

      expect(registerFieldsToIncludeMock).not.toHaveBeenCalled();
    });
  });

  // #initializeWithInsightEngine
  describe('#initializeWithInsightEngine', () => {
    it('should set the engine directly without building a new one', async () => {
      const element = await setupElement();
      const engine = buildFakeInsightEngine({});

      expect(element.engine).toBeUndefined();

      await element.initializeWithInsightEngine(engine);

      expect(element.engine).toBe(engine);
    });

    it('should set bindings after initialization with provided engine', async () => {
      const element = await setupElement();
      const engine = buildFakeInsightEngine({});

      expect(element.bindings.engine).toBeUndefined();

      await element.initializeWithInsightEngine(engine);

      expect(element.bindings.engine).toBe(engine);
      expect(element.bindings.i18n).toBe(element.i18n);
      expect(element.bindings.store).toBe(element.store);
      expect(element.bindings.interfaceElement).toBe(element);
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
      const engine = buildFakeInsightEngine({});
      element.engine = engine;

      await element.executeFirstSearch();

      expect(consoleSpy).toHaveBeenCalledExactlyOnceWith(
        'You have to wait until the "initialize" promise is fulfilled before executing a search.',
        element
      );
    });

    it('should call engine.executeFirstSearch when properly initialized', async () => {
      const element = await setupElement();
      const engine = buildFakeInsightEngine({});
      const executeFirstSearchSpy = vi.spyOn(engine, 'executeFirstSearch');

      await element.initializeWithInsightEngine(engine);
      await element.executeFirstSearch();

      expect(executeFirstSearchSpy).toHaveBeenCalledOnce();
    });
  });

  // Property watchers
  describe('property watchers', () => {
    // #toggleAnalytics
    describe('when analytics prop changes', () => {
      it('should call InterfaceController.onAnalyticsChange', async () => {
        // We're updating attributes before calling #initialize; this would console.error.
        vi.spyOn(console, 'error').mockImplementation(() => {});

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
      it('should call InterfaceController.onLanguageChange', async () => {
        // We're updating attributes before calling #initialize; this would console.error.
        vi.spyOn(console, 'error').mockImplementation(() => {});

        const element = await setupElement();
        const onLanguageChangeSpy = vi.spyOn(
          InterfaceController.prototype,
          'onLanguageChange'
        );

        expect(onLanguageChangeSpy).not.toHaveBeenCalled();

        element.language = 'fr';
        await element.updateComplete;

        expect(onLanguageChangeSpy).toHaveBeenCalledOnce();
      });
    });

    // #updateIconAssetsPath
    describe('when iconAssetsPath prop changes', () => {
      it('should update store.state.iconAssetsPath', async () => {
        // We're updating attributes before calling #initialize; this would console.error.
        vi.spyOn(console, 'error').mockImplementation(() => {});

        const element = await setupElement();

        element.iconAssetsPath = '/new/icon/assets/path';
        await element.updateComplete;

        expect(element.store.state.iconAssetsPath).toBe(
          '/new/icon/assets/path'
        );
      });
    });
  });

  // #disconnectedCallback
  describe('when removed from the DOM', () => {
    it('should remove the atomic/initializeComponent event listener', async () => {
      const element = await setupElement();
      const removeEventListenerSpy = vi.spyOn(element, 'removeEventListener');

      element.remove();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'atomic/initializeComponent',
        expect.any(Function)
      );
    });
  });

  // #render
  describe('render', () => {
    it('should render slots when engine is defined', async () => {
      const element = await setupElement();
      const engine = buildFakeInsightEngine({});

      await element.initializeWithInsightEngine(engine);
      await element.updateComplete;

      expect(
        element.shadowRoot?.querySelector('slot[name="full-search"]')
      ).toBeTruthy();
      expect(
        element.shadowRoot?.querySelector('slot:not([name])')
      ).toBeTruthy();
    });

    it('should render its children', async () => {
      const element = await setupElement();
      const engine = buildFakeInsightEngine({});

      await element.initializeWithInsightEngine(engine);
      await addChildElement(element);
      await element.updateComplete;

      expect(within(element).queryByShadowText('test-element')).toBeTruthy();
    });
  });

  // Error handling
  describe('error handling', () => {
    it('should set error property when engine initialization fails', async () => {
      vi.mocked(headless.buildInsightEngine).mockImplementation(() => {
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
      const engine = buildFakeInsightEngine({});

      await element.initializeWithInsightEngine(engine);

      expect(childElement.bindings).toBe(element.bindings);
    });

    it('should provide createStyleElement function in bindings', async () => {
      const element = await setupElement();
      const engine = buildFakeInsightEngine({});

      await element.initializeWithInsightEngine(engine);

      const styleElement = element.bindings.createStyleElement();
      expect(styleElement).toBeInstanceOf(HTMLStyleElement);
      expect(styleElement.tagName).toBe('STYLE');
    });

    it('should provide createScriptElement function in bindings', async () => {
      const element = await setupElement();
      const engine = buildFakeInsightEngine({});

      await element.initializeWithInsightEngine(engine);

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

    it('should handle custom results per page', async () => {
      const element = await setupElement({resultsPerPage: 15});

      expect(element.resultsPerPage).toBe(15);
    });
  });
});
