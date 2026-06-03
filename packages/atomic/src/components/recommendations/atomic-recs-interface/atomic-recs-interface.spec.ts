import {
  buildRecommendationEngine,
  EcommerceDefaultFieldsToInclude,
  getSampleRecommendationEngineConfiguration,
  loadFieldActions,
  loadRecommendationActions,
  loadSearchConfigurationActions,
  type RecommendationEngineConfiguration,
} from '@coveo/headless/recommendation';
import {html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import {within} from 'shadow-dom-testing-library';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {InterfaceController} from '@/src/components/common/interface/interface-controller';
import {createRecsStore} from '@/src/components/recommendations/atomic-recs-interface/store';
import {bindings} from '@/src/decorators/bindings';
import type {InitializableComponent} from '@/src/decorators/types';
import {markParentAsReady} from '@/src/utils/init-queue';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {buildFakeRecommendationEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/recommendation/engine';
import {getAnalyticsConfig} from './analytics-config';
import type {RecsBindings} from './atomic-recs-interface';
import {AtomicRecsInterface} from './atomic-recs-interface';

vi.mock('@coveo/headless/recommendation', {spy: true});
vi.mock('@coveo/headless', {spy: true});
vi.mock('@/src/components/common/interface/analytics-config', {spy: true});
vi.mock('@/src/components/recommendations/atomic-recs-interface/store', {
  spy: true,
});
vi.mock('@/src/utils/init-queue', {spy: true});
vi.mock('./analytics-config', {spy: true});

@customElement('test-element')
@bindings()
class TestElement
  extends LitElement
  implements InitializableComponent<RecsBindings>
{
  @state()
  public bindings: RecsBindings = {} as RecsBindings;
  @state() public error!: Error;

  public initialize = vi.fn();

  public render() {
    return html`test-element`;
  }
}

describe('atomic-recs-interface', () => {
  const recommendationEngineConfig: RecommendationEngineConfiguration =
    getSampleRecommendationEngineConfiguration();

  const setupElement = async (
    props: {
      analytics?: boolean;
      iconAssetsPath?: string;
      language?: string;
      languageAssetsPath?: string;
      logLevel?: LogLevel;
      fieldsToInclude?: string[];
      pipeline?: string;
      searchHub?: string;
      timezone?: string;
    } = {}
  ) => {
    const element = (await fixture<AtomicRecsInterface>(
      html`<atomic-recs-interface
        analytics=${props.analytics}
        icon-assets-path=${ifDefined(props.iconAssetsPath)}
        language=${ifDefined(props.language)}
        language-assets-path=${ifDefined(props.languageAssetsPath)}
        log-level=${ifDefined(props.logLevel)}
        .fieldsToInclude=${props.fieldsToInclude || []}
        pipeline=${ifDefined(props.pipeline)}
        search-hub=${ifDefined(props.searchHub)}
        timezone=${ifDefined(props.timezone)}
      >
        <div>Interface content</div>
      </atomic-recs-interface>`
    )) as AtomicRecsInterface;

    expect(element).toBeInstanceOf(AtomicRecsInterface);
    return element;
  };

  const addChildElement = async (element: Element, tag = 'test-element') => {
    const childElement = document.createElement(
      tag
    ) as InitializableComponent<RecsBindings> & TestElement;
    element.appendChild(childElement);

    await childElement.updateComplete;
    expect(childElement).toBeInstanceOf(TestElement);

    return childElement;
  };

  beforeEach(() => {
    vi.mocked(buildRecommendationEngine).mockReturnValue(
      buildFakeRecommendationEngine()
    );

    vi.mocked(loadFieldActions).mockReturnValue({
      registerFieldsToInclude: vi.fn(),
      enableFetchAllFields: vi.fn(),
      disableFetchAllFields: vi.fn(),
      fetchFieldsDescription: vi.fn(),
    });

    vi.mocked(loadRecommendationActions).mockReturnValue({
      getRecommendations: vi.fn(),
      setRecommendationId: vi.fn(),
    });

    vi.mocked(loadSearchConfigurationActions).mockReturnValue({
      updateSearchConfiguration: vi.fn(),
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
        AtomicRecsInterface.prototype,
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
    testedInitMethodName: 'initialize' | 'initializeWithRecommendationEngine';
  }>([
    {
      testedInitMethodName: 'initialize',
    },
    {
      testedInitMethodName: 'initializeWithRecommendationEngine',
    },
  ])('#$testedInitMethodName', ({testedInitMethodName}) => {
    const callTestedInitMethod = async (
      element: Awaited<ReturnType<typeof setupElement>>
    ) => {
      if (testedInitMethodName === 'initialize') {
        await element.initialize(recommendationEngineConfig);
      } else {
        const engine = buildFakeRecommendationEngine({});
        await element.initializeWithRecommendationEngine(engine);
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
      it('should default to "en" language', async () => {
        const element = await setupElement();

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
      const mockedCreateStore = vi.mocked(createRecsStore);
      const element = await setupElement();

      await callTestedInitMethod(element);

      expect(mockedCreateStore).toHaveBeenCalledExactlyOnceWith();

      expect(element.bindings).toEqual({
        engine: element.engine,
        i18n: element.i18n,
        store: mockedCreateStore.mock.results[0].value,
        interfaceElement: element,
      });
    });

    it('should provide bindings to its descendant components', async () => {
      const element = await setupElement();
      const childElement = await addChildElement(element);

      await callTestedInitMethod(element);

      expect(childElement.bindings).toBe(element.bindings);
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

    describe.skipIf(testedInitMethodName !== 'initialize')(
      '#initialize only',
      () => {
        it('should call #buildRecommendationEngine with the correct configuration', async () => {
          const mockedGetAnalyticsConfig = vi.mocked(getAnalyticsConfig);
          const element = await setupElement({
            pipeline: 'test-pipeline',
            searchHub: 'test-hub',
            language: 'fr',
            timezone: 'America/Montreal',
            logLevel: 'debug',
          });
          const mockedBuildRecommendationEngine = vi.mocked(
            buildRecommendationEngine
          );

          // Use config without searchHub to test that property value is used
          const {searchHub: _, ...configWithoutSearchHub} =
            recommendationEngineConfig;

          await element.initialize(configWithoutSearchHub);

          expect(getAnalyticsConfig).toHaveBeenCalledExactlyOnceWith(
            configWithoutSearchHub,
            element.analytics
          );
          expect(
            mockedBuildRecommendationEngine
          ).toHaveBeenCalledExactlyOnceWith({
            configuration: {
              ...configWithoutSearchHub,
              pipeline: 'test-pipeline',
              searchHub: 'test-hub',
              locale: 'fr',
              timezone: 'America/Montreal',
              analytics: mockedGetAnalyticsConfig.mock.results[0].value,
            },
            loggerOptions: {
              level: 'debug',
            },
          });
        });

        it('should default searchHub to "default" when not provided', async () => {
          const element = await setupElement();
          const mockedBuildRecommendationEngine = vi.mocked(
            buildRecommendationEngine
          );

          await element.initialize(recommendationEngineConfig);

          expect(mockedBuildRecommendationEngine).toHaveBeenCalledWith(
            expect.objectContaining({
              configuration: expect.objectContaining({
                searchHub: 'default',
              }),
            })
          );
        });

        it('should use searchHub from options when both property and options are provided', async () => {
          const element = await setupElement({searchHub: 'property-hub'});
          const mockedBuildRecommendationEngine = vi.mocked(
            buildRecommendationEngine
          );

          await element.initialize({
            ...recommendationEngineConfig,
            searchHub: 'options-hub',
          });

          expect(mockedBuildRecommendationEngine).toHaveBeenCalledWith(
            expect.objectContaining({
              configuration: expect.objectContaining({
                searchHub: 'options-hub',
              }),
            })
          );
        });

        it('should use pipeline from options when both property and options are provided', async () => {
          const element = await setupElement({pipeline: 'property-pipeline'});
          const mockedBuildRecommendationEngine = vi.mocked(
            buildRecommendationEngine
          );

          await element.initialize({
            ...recommendationEngineConfig,
            pipeline: 'options-pipeline',
          });

          expect(mockedBuildRecommendationEngine).toHaveBeenCalledWith(
            expect.objectContaining({
              configuration: expect.objectContaining({
                pipeline: 'options-pipeline',
              }),
            })
          );
        });

        it('should update pipeline and searchHub properties from engine state', async () => {
          const element = await setupElement();
          const mockEngine = buildFakeRecommendationEngine({
            state: {
              pipeline: 'engine-pipeline',
              searchHub: 'engine-hub',
            },
          });
          vi.mocked(buildRecommendationEngine).mockReturnValue(mockEngine);

          await element.initialize(recommendationEngineConfig);

          expect(element.pipeline).toBe('engine-pipeline');
          expect(element.searchHub).toBe('engine-hub');
        });

        it('should register fields to include', async () => {
          const mockRegisterFieldsToInclude = vi.fn();
          vi.mocked(loadFieldActions).mockReturnValue({
            registerFieldsToInclude: mockRegisterFieldsToInclude,
            enableFetchAllFields: vi.fn(),
            disableFetchAllFields: vi.fn(),
            fetchFieldsDescription: vi.fn(),
          });

          const element = await setupElement({
            fieldsToInclude: ['custom_field_1', 'custom_field_2'],
          });

          await element.initialize(recommendationEngineConfig);

          expect(mockRegisterFieldsToInclude).toHaveBeenCalledWith(
            expect.arrayContaining([
              ...EcommerceDefaultFieldsToInclude,
              'custom_field_1',
              'custom_field_2',
            ])
          );
        });
      }
    );

    describe.skipIf(
      testedInitMethodName !== 'initializeWithRecommendationEngine'
    )('#initializeWithRecommendationEngine only', () => {
      it('should use the provided engine', async () => {
        const element = await setupElement();
        const mockEngine = buildFakeRecommendationEngine({
          state: {
            pipeline: 'external-pipeline',
            searchHub: 'external-hub',
          },
        });

        await element.initializeWithRecommendationEngine(mockEngine);

        expect(element.engine).toBe(mockEngine);
      });

      it('should warn when pipeline prop does not match engine pipeline', async () => {
        const element = await setupElement({pipeline: 'interface-pipeline'});
        const consoleWarnSpy = vi.spyOn(console, 'warn');
        const mockEngine = buildFakeRecommendationEngine({
          state: {
            pipeline: 'engine-pipeline',
            searchHub: 'default',
          },
        });

        await element.initializeWithRecommendationEngine(mockEngine);

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('query pipeline')
        );
      });

      it('should warn when searchHub prop does not match engine searchHub', async () => {
        const element = await setupElement({searchHub: 'interface-hub'});
        const consoleWarnSpy = vi.spyOn(console, 'warn');
        const mockEngine = buildFakeRecommendationEngine({
          state: {
            pipeline: 'default',
            searchHub: 'engine-hub',
          },
        });

        await element.initializeWithRecommendationEngine(mockEngine);

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('search hub')
        );
      });

      it('should not warn when props match engine state', async () => {
        const element = await setupElement({
          pipeline: 'same-pipeline',
          searchHub: 'same-hub',
        });
        const consoleWarnSpy = vi.spyOn(console, 'warn');
        const mockEngine = buildFakeRecommendationEngine({
          state: {
            pipeline: 'same-pipeline',
            searchHub: 'same-hub',
          },
        });

        await element.initializeWithRecommendationEngine(mockEngine);

        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('#getRecommendations', () => {
    it('should do nothing when called before engine is created', async () => {
      const element = await setupElement();
      const consoleErrorSpy = vi.spyOn(console, 'error');

      await element.getRecommendations();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('You have to call "initialize"'),
        expect.anything()
      );
    });

    it('should log an error when called before initialization finishes', async () => {
      const element = await setupElement();
      const consoleErrorSpy = vi.spyOn(console, 'error');
      element.initialize(recommendationEngineConfig);

      await element.getRecommendations();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'You have to wait until the "initialize" promise is fulfilled'
        ),
        element
      );
    });

    it('should dispatch getRecommendations action when initialized', async () => {
      const element = await setupElement();
      const mockGetRecommendations = vi.fn();
      const mockDispatch = vi.fn();
      vi.mocked(loadRecommendationActions).mockReturnValue({
        getRecommendations: mockGetRecommendations,
        setRecommendationId: vi.fn(),
      });

      await element.initialize(recommendationEngineConfig);
      element.engine!.dispatch = mockDispatch;

      await element.getRecommendations();

      expect(mockGetRecommendations).toHaveBeenCalledExactlyOnceWith();
      expect(mockDispatch).toHaveBeenCalledExactlyOnceWith(
        mockGetRecommendations()
      );
    });
  });

  // #toggleAnalytics
  it('should call InterfaceController.onAnalyticsChange when the analytics attribute changes', async () => {
    const element = await setupElement();
    await element.initialize(recommendationEngineConfig);
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
    await element.initialize(recommendationEngineConfig);

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
    it('should do nothing when the engine has not been created', async () => {
      const element = await setupElement();
      const consoleErrorSpy = vi.spyOn(console, 'error');
      const mockUpdateSearchConfiguration = vi.fn();
      vi.mocked(loadSearchConfigurationActions).mockReturnValue({
        updateSearchConfiguration: mockUpdateSearchConfiguration,
      });

      element.language = 'fr';
      await element.updateComplete;

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(mockUpdateSearchConfiguration).not.toHaveBeenCalled();
    });

    describe('when the engine has been created', () => {
      it('should dispatch updateSearchConfiguration with the new locale', async () => {
        const element = await setupElement({language: 'en'});
        const mockUpdateSearchConfiguration = vi.fn();
        const mockDispatch = vi.fn();
        vi.mocked(loadSearchConfigurationActions).mockReturnValue({
          updateSearchConfiguration: mockUpdateSearchConfiguration,
        });

        await element.initialize(recommendationEngineConfig);
        element.engine!.dispatch = mockDispatch;

        element.language = 'fr';
        await element.updateComplete;

        expect(mockUpdateSearchConfiguration).toHaveBeenCalledWith({
          locale: 'fr',
        });
        expect(mockDispatch).toHaveBeenCalledWith(
          mockUpdateSearchConfiguration({locale: 'fr'})
        );
      });

      it('should call InterfaceController.onLanguageChange', async () => {
        const element = await setupElement({language: 'en'});
        const onLanguageChangeSpy = vi.spyOn(
          InterfaceController.prototype,
          'onLanguageChange'
        );

        await element.initialize(recommendationEngineConfig);

        element.language = 'fr';
        await element.updateComplete;

        expect(onLanguageChangeSpy).toHaveBeenCalled();
      });
    });
  });

  describe('#disconnectedCallback (when removed from the DOM)', () => {
    it('should remove aria-live element', async () => {
      const element = await setupElement();
      await element.initialize(recommendationEngineConfig);

      const ariaLive = element.querySelector('atomic-aria-live');
      expect(ariaLive).toBeTruthy();

      element.disconnectedCallback();

      const ariaLiveAfterDisconnect = element.querySelector('atomic-aria-live');
      expect(ariaLiveAfterDisconnect).toBeFalsy();
    });

    it('should remove the atomic/initializeComponent event listener', async () => {
      const element = await setupElement();
      const removeEventListenerSpy = vi.spyOn(element, 'removeEventListener');

      element.disconnectedCallback();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'atomic/initializeComponent',
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
