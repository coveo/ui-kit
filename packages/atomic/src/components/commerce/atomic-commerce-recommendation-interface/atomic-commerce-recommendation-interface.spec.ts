import {bindings} from '@/src/decorators/bindings';
import {InitializableComponent} from '@/src/decorators/types';
import {InitializeBindingsMixin} from '@/src/mixins/bindings-mixin';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {fixtureCleanup} from '@/vitest-utils/testing-helpers/fixture-wrapper';
import {
  CommerceEngineConfiguration,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless/commerce';
import {buildCommerceEngine} from '@coveo/headless/commerce';
import {html} from 'lit';
import {LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {within} from 'shadow-dom-testing-library';
import {describe, test, expect, vi} from 'vitest';
import {stateKey} from '../../../../../headless/src/app/state-key';
import {
  AtomicCommerceRecommendationInterface,
  CommerceBindings,
} from './atomic-commerce-recommendation-interface';

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
export class TestElement
  extends InitializeBindingsMixin(LitElement)
  implements InitializableComponent<CommerceBindings>
{
  @state()
  public bindings: CommerceBindings = {} as CommerceBindings;
  @state() public error!: Error;

  public addStyles(styles: string | CSSStyleSheet) {
    if (typeof styles === 'string') {
      const styleSheet = new CSSStyleSheet();
      styleSheet.replaceSync(styles);
      this.bindings.addAdoptedStyleSheets(styleSheet);
    } else if (styles instanceof CSSStyleSheet) {
      this.bindings.addAdoptedStyleSheets(styles);
    }
  }

  public initialized = false;

  public render() {
    return html`test-element`;
  }

  initialize = vi.fn();
}

const commerceEngineConfig: CommerceEngineConfiguration =
  getSampleCommerceEngineConfiguration();
describe('AtomicCommerceRecommendationInterface', () => {
  let element: AtomicCommerceRecommendationInterface;
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
    element = (await fixture<AtomicCommerceRecommendationInterface>(
      html`<atomic-commerce-recommendation-interface
        ><div>
          atomic-commerce-recommendation-interface
        </div></atomic-commerce-recommendation-interface
      >`
    )) as AtomicCommerceRecommendationInterface;

    await element.updateComplete;
    expect(element).toBeInstanceOf(AtomicCommerceRecommendationInterface);
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
    await element.initializeWithEngine(
      buildCommerceEngine({
        configuration: commerceEngineConfig,
      })
    );
    expect(element.engine).toBeTruthy();
    expect(element.engine?.configuration.organizationId).toBe(
      commerceEngineConfig.organizationId
    );
    expect(element.engine?.configuration.analytics.trackingId).toBe(
      commerceEngineConfig.analytics.trackingId
    );
  });

  describe('before being initialized', () => {
    test('when changing a property too early, should return error', async () => {
      const errorMessage =
        'You have to call "initialize" on the atomic-commerce-recommendation-interface component before modifying the props or calling other public methods.';
      element.language = 'fr';
      await element.updateComplete;
      expect(consoleErrorSpy).toHaveBeenCalledWith(errorMessage, element);
    });
  });

  describe('when initialized with existing engine', () => {
    let preconfiguredEngine: ReturnType<typeof buildCommerceEngine>;

    beforeEach(async () => {
      preconfiguredEngine = buildCommerceEngine({
        configuration: getSampleCommerceEngineConfiguration(),
      });

      await element.initializeWithEngine(preconfiguredEngine);
      await element.updateComplete;
      await addChildElement();
      await childElement.updateComplete;
    });

    test('should render the component and its children', async () => {
      expect(element.shadowRoot).toBeTruthy();
      expect(within(element).queryByShadowText('test-element')).toBeTruthy();
    });

    test('should trigger the initialize method of the child component', async () => {
      console.log('childElement', childElement);
      expect(childElement.initialize).toHaveBeenCalledOnce();
    });

    test('should provide bindings to children', async () => {
      expect(childElement.bindings).toBeDefined();
      console.log('childElement.bindings', childElement.bindings);
      expect(childElement.bindings.engine).toBe(element.engine);
      expect(childElement.bindings.i18n).toBe(element.i18n);
      expect(childElement.bindings.store).toBe(element.store);
    });

    test('should initialize with a preconfigured engine', async () => {
      expect(element.engine).toBe(preconfiguredEngine);
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

    test('should add a stylesheet to adoptedStyleSheets', async () => {
      const styles = 'body { background-color: red; }';
      childElement.addStyles(styles);

      const parent = element.getRootNode();

      if (parent instanceof Document || parent instanceof ShadowRoot) {
        const styleSheet = parent.adoptedStyleSheets.find((sheet) =>
          sheet.cssRules[0]?.cssText.includes(styles)
        );
        expect(styleSheet).toBeDefined();
      }
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

      test('should initialize i18n instance after initialization', async () => {
        expect(element.i18n).toBeDefined();
        expect(element.i18n.isInitialized).toBeTruthy();
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

  describe('aria-live', () => {
    test('should add aria-live if no atomic-aria-live element exists', async () => {
      await element.initializeWithEngine(
        buildCommerceEngine({
          configuration: commerceEngineConfig,
        })
      );
      const ariaLiveElement = element.querySelector('atomic-aria-live');
      expect(ariaLiveElement).toBeTruthy();
    });

    test('should not add aria-live if an atomic-aria-live element already exists', async () => {
      const existingAriaLive = document.createElement('atomic-aria-live');
      element.appendChild(existingAriaLive);

      await element.initializeWithEngine(
        buildCommerceEngine({
          configuration: commerceEngineConfig,
        })
      );

      const ariaLiveElements = element.querySelectorAll('atomic-aria-live');
      expect(ariaLiveElements.length).toBe(1);
    });
    test('should remove aria-live on disconnect', async () => {
      await element.initializeWithEngine(
        buildCommerceEngine({
          configuration: commerceEngineConfig,
        })
      );
      await element.updateComplete;
      element.disconnectedCallback();
      const ariaLiveElement = element?.querySelector('atomic-aria-live');
      expect(ariaLiveElement).toBeFalsy();
    });
  });
});
