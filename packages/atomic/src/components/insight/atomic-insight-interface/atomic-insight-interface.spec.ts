import {html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import {within} from 'shadow-dom-testing-library';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {bindings} from '@/src/decorators/bindings';
import type {InitializableComponent} from '@/src/decorators/types';
import {markParentAsReady} from '@/src/utils/init-queue.js';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {InterfaceController} from '../../common/interface/interface-controller.js';
import {getAnalyticsConfig} from './analytics-config.js';
import {
  AtomicInsightInterface,
  type InsightBindings,
} from './atomic-insight-interface';
import {createInsightStore} from './store.js';
import './atomic-insight-interface.js';
import {
  buildInsightEngine,
  buildResultsPerPage,
  getSampleInsightEngineConfiguration,
  type InsightEngineConfiguration,
  type LogLevel,
  loadFieldActions,
} from '@coveo/headless/insight';
import {buildFakeInsightEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/insight/engine.js';

vi.mock('@coveo/headless/insight', {spy: true});
vi.mock('./analytics-config.js', {spy: true});
vi.mock('./store.js', {spy: true});
vi.mock('@/src/utils/init-queue.js', {spy: true});

@customElement('test-element')
@bindings()
class TestElement
  extends LitElement
  implements InitializableComponent<InsightBindings>
{
  @state()
  public bindings: InsightBindings = {} as InsightBindings;
  @state() public error!: Error;

  public initialize = vi.fn();

  public render() {
    return html`test-element`;
  }
}

describe('atomic-insight-interface', () => {
  const insightEngineConfig: InsightEngineConfiguration =
    getSampleInsightEngineConfiguration();

  const setupElement = async (
    props: {
      analytics?: boolean; // TODO - (v4) KIT-4990: remove.
      fieldsToInclude?: string[];
      iconAssetsPath?: string;
      language?: string;
      languageAssetsPath?: string;
      logLevel?: LogLevel;
      resultsPerPage?: number;
    } = {}
  ) => {
    const element = (await fixture<AtomicInsightInterface>(
      html`<atomic-insight-interface
        analytics=${props.analytics}
        fields-to-include=${ifDefined(JSON.stringify(props.fieldsToInclude))}
        icon-assets-path=${ifDefined(props.iconAssetsPath)}
        language=${ifDefined(props.language)}
        language-assets-path=${ifDefined(props.languageAssetsPath)}
        log-level=${ifDefined(props.logLevel)}
        results-per-page=${ifDefined(props.resultsPerPage)}
        ><div>Interface content</div></atomic-insight-interface
      >`
    )) as AtomicInsightInterface;

    expect(element).toBeInstanceOf(AtomicInsightInterface);

    return element;
  };

  const addChildElement = async (element: Element, tag = 'test-element') => {
    const childElement = document.createElement(
      tag
    ) as InitializableComponent<InsightBindings> & TestElement;
    element.appendChild(childElement);

    await childElement.updateComplete;
    expect(childElement).toBeInstanceOf(TestElement);

    return childElement;
  };

  beforeEach(() => {
    vi.mocked(buildInsightEngine).mockReturnValue(buildFakeInsightEngine());
    vi.mocked(buildResultsPerPage).mockReturnValue({} as never);
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
        AtomicInsightInterface.prototype,
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
  });

  describe.for<{
    testedInitMethodName: 'initialize' | 'initializeWithInsightEngine';
  }>([
    {
      testedInitMethodName: 'initialize',
    },
    {
      testedInitMethodName: 'initializeWithInsightEngine',
    },
  ])('#$testedInitMethodName', ({testedInitMethodName}) => {
    const callTestedInitMethod = async (
      element: Awaited<ReturnType<typeof setupElement>>
    ) => {
      if (testedInitMethodName === 'initialize') {
        await element.initialize(insightEngineConfig);
      } else {
        await element.initializeWithInsightEngine(buildFakeInsightEngine());
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

    it('should call #updateLanguage', async () => {
      const element = await setupElement({language: 'en'});
      const updateLanguageSpy = vi.spyOn(element, 'updateLanguage');

      await callTestedInitMethod(element);

      expect(updateLanguageSpy).toHaveBeenCalledOnce();
    });

    it('should set the bindings', async () => {
      const mockedCreateInsightStore = vi.mocked(createInsightStore);
      const element = await setupElement();

      await callTestedInitMethod(element);

      expect(mockedCreateInsightStore).toHaveBeenCalledOnce();

      expect(element.bindings).toEqual({
        engine: element.engine,
        i18n: element.i18n,
        store: mockedCreateInsightStore.mock.results[0].value,
        interfaceElement: element,
        createStyleElement: expect.any(Function), // TODO - KIT-4839: Remove once atomic-insight-layout migration is complete.
        createScriptElement: expect.any(Function), // TODO - KIT-4839: Remove once atomic-insight-layout migration is complete.
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

    it('should call buildResultsPerPage with the default value (5) when resultsPerPage is unspecified', async () => {
      const element = await setupElement();

      await callTestedInitMethod(element);

      expect(buildResultsPerPage).toHaveBeenCalledExactlyOnceWith(
        element.bindings.engine,
        {initialState: {numberOfResults: 5}}
      );
    });

    it('should call buildResultsPerPage with correct value when resultsPerPage is specified', async () => {
      const element = await setupElement({resultsPerPage: 15});

      await callTestedInitMethod(element);

      expect(buildResultsPerPage).toHaveBeenCalledExactlyOnceWith(
        element.bindings.engine,
        {initialState: {numberOfResults: 15}}
      );
    });

    it('should not dispatch a registerFieldsToInclude action when fieldsToInclude is unspecified', async () => {
      const loadFieldActionsSpy = vi.mocked(loadFieldActions);
      const element = await setupElement();

      await callTestedInitMethod(element);

      expect(loadFieldActionsSpy).not.toHaveBeenCalled();
    });

    it('should dispatch a registerFieldsToInclude action with the fields to include when specified', async () => {
      const registerFieldsToIncludeMock = vi.fn();
      const loadFieldActionsSpy = vi.mocked(loadFieldActions).mockReturnValue({
        registerFieldsToInclude: registerFieldsToIncludeMock,
        disableFetchAllFields: vi.fn(),
        enableFetchAllFields: vi.fn(),
        fetchFieldsDescription: vi.fn(),
      });
      const element = await setupElement({
        fieldsToInclude: ['fieldA', 'fieldB'],
      });

      await callTestedInitMethod(element);
      expect(loadFieldActionsSpy).toHaveBeenCalledWith(element.bindings.engine);
      expect(registerFieldsToIncludeMock).toHaveBeenCalledWith([
        'fieldA',
        'fieldB',
      ]);
    });

    describe.skipIf(testedInitMethodName !== 'initialize')(
      '#initialize only',
      () => {
        it('should set the engine with #buildInsightEngine', async () => {
          const element = await setupElement();

          await element.initialize(insightEngineConfig);

          expect(element.engine).toBe(
            vi.mocked(buildInsightEngine).mock.results[0].value
          );
        });

        it('should pass the specified configuration and log level, along with an analytics configuration augmented with #getAnalyticsConfig to #buildCommerceEngine when setting the engine', async () => {
          const mockedGetAnalyticsConfig = vi.mocked(getAnalyticsConfig);
          const element = await setupElement();

          await element.initialize(insightEngineConfig);

          expect(getAnalyticsConfig).toHaveBeenCalledExactlyOnceWith(
            insightEngineConfig,
            element.analytics
          );
          expect(buildInsightEngine).toHaveBeenCalledExactlyOnceWith({
            configuration: {
              ...insightEngineConfig,
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

          vi.mocked(buildInsightEngine).mockImplementation(() => {
            throw buildEngineError;
          });

          await element.initialize(insightEngineConfig).catch(() => {});

          expect(element.engine).toBeUndefined();
          expect(element.error).toBe(buildEngineError);
        });
      }
    );

    describe.skipIf(testedInitMethodName !== 'initializeWithInsightEngine')(
      '#initializeWithInsightEngine only',
      () => {
        it('should initialize with a preconfigured engine', async () => {
          const element = await setupElement();
          const engine = buildFakeInsightEngine();

          await element.initializeWithInsightEngine(engine);

          expect(element.engine).toBe(engine);
        });
      }
    );
  });

  describe('#executeFirstSearch', () => {
    it('should log an error when called before initialization', async () => {
      const element = await setupElement();
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      await element.executeFirstSearch();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'You have to call "initialize" on the atomic-insight-interface component before modifying the props or calling other public methods.',
        element
      );
    });

    it('should log an error when called before initialization finishes', async () => {
      const element = await setupElement();
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      element.engine = buildFakeInsightEngine(); // Simulate that the engine was created but the interface wasn't initialized

      await element.executeFirstSearch();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'You have to wait until the "initialize" promise is fulfilled before executing a search.',
        element
      );
    });

    it('should call executeFirstSearch on the engine when the engine has been created and initialization has finished', async () => {
      const element = await setupElement();
      element.engine = buildFakeInsightEngine();
      const executeFirstSearchSpy = vi.spyOn(
        element.engine,
        'executeFirstSearch'
      );
      await element.initializeWithInsightEngine(element.engine);

      await element.executeFirstSearch();

      expect(executeFirstSearchSpy).toHaveBeenCalledOnce();
    });
  });

  // TODO - KIT-4994 / KIT-4990: adjust
  // #toggleAnalytics
  it('should call InterfaceController.onAnalyticsChange when the analytics attribute changes', async () => {
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

  // #updateIconAssetsPath
  it('should update the icon assets path in the bindings when the iconAssetsPath attribute changes', async () => {
    const element = await setupElement();
    await element.initialize(insightEngineConfig);

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
  describe('when the language attribute changes', () => {
    it('should call InterfaceController.onLanguageChange with no argument', async () => {
      const element = await setupElement({language: 'en'});
      await element.initialize(insightEngineConfig);
      const onLanguageChangeSpy = vi.spyOn(
        InterfaceController.prototype,
        'onLanguageChange'
      );

      element.language = 'fr';
      await element.updateComplete;

      expect(onLanguageChangeSpy).toHaveBeenCalledExactlyOnceWith();
    });
  });

  describe('#disconnectedCallback (when removed from the DOM)', () => {
    // Done through the InterfaceController
    it('should remove aria-live element', async () => {
      const element = await setupElement();
      await element.initialize(insightEngineConfig);

      expect(element.querySelector('atomic-aria-live')).toBeTruthy();

      element.remove();

      expect(element.querySelector('atomic-aria-live')).toBeFalsy();
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
  });

  describe('when rendering (#render)', () => {
    it('should render a full-search slot', async () => {
      const element = await setupElement();

      const fullSearchSlot = element.shadowRoot?.querySelector(
        'slot[name="full-search"]'
      );
      expect(fullSearchSlot).toBeTruthy();
    });

    it('should render a default slot', async () => {
      const element = await setupElement();

      const slots = element.shadowRoot?.querySelectorAll('slot');
      const namedSlots = element.shadowRoot?.querySelectorAll('slot[name]');
      expect(slots?.length).toBe(2);
      expect(namedSlots?.length).toBe(1);
    });

    it('should render its children', async () => {
      const element = await setupElement();
      await addChildElement(element);

      expect(within(element).queryByShadowText('test-element')).toBeTruthy();
    });
  });
});
