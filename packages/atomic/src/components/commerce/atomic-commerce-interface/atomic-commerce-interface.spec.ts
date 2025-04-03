import {bindings} from '@/src/decorators/bindings';
import {InitializableComponent} from '@/src/decorators/types';
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
import {InitializeBindingsMixin} from '../../../mixins/bindings-mixin';
import {
  AtomicCommerceInterface,
  CommerceBindings,
} from './atomic-commerce-interface';

vi.mock('@coveo/headless/commerce', () => {
  const originalModule = vi.importActual('@coveo/headless/commerce');
  return {
    ...originalModule,
    buildCommerceEngine: vi.fn(() => ({
      dispatch: vi.fn(),
      enableAnalytics: vi.fn(),
      disableAnalytics: vi.fn(),
      logger: {warn: vi.fn()},
      store: {
        getState: vi.fn(() => ({configuration: {analytics: {enabled: true}}})),
      },
    })),
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

  public initialized = false;

  public render() {
    return html`Child Element Content`;
  }

  initialize = vi.fn();
}

const commerceEngineConfig: CommerceEngineConfiguration =
  getSampleCommerceEngineConfiguration();
describe('AtomicCommerceInterface', () => {
  let element: AtomicCommerceInterface;
  let childElement: InitializableComponent<Bindings> & LitElement;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  const addChildElement = async <T extends LitElement>(
    tag = 'test-element'
  ) => {
    childElement = document.createElement(
      tag
    ) as InitializableComponent<Bindings> & T;
    element.appendChild(childElement);

    await childElement.updateComplete;
    expect(childElement).toBeInstanceOf(TestElement);
  };

  const setupElement = async () => {
    element = await fixture<AtomicCommerceInterface>(
      html` <atomic-commerce-interface>test</atomic-commerce-interface>`
    );

    await element.updateComplete;
    expect(element).toBeInstanceOf(AtomicCommerceInterface);
  };

  beforeEach(async () => {
    await setupElement();
    consoleErrorSpy = vi.spyOn(console, 'error');
  });

  afterEach(async () => {
    fixtureCleanup();
    consoleErrorSpy.mockRestore();
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

  describe('before being initialized', () => {
    test('should log an error when calling "executeFirstRequest"', async () => {
      const errorMessage =
        'You have to call "initialize" on the atomic-commerce-interface component before modifying the props or calling other public methods.';
      await element.executeFirstRequest();
      expect(consoleErrorSpy).toHaveBeenCalledWith(errorMessage, element.host);
    });

    test('should return error when changing a property too early', async () => {
      const errorMessage =
        'You have to call "initialize" on the atomic-commerce-interface component before modifying the props or calling other public methods.';
      element.language = 'fr';
      await element.updateComplete;
      expect(consoleErrorSpy).toHaveBeenCalledWith(errorMessage, element.host);
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
      expect(
        within(element).queryByShadowText('Child Element Content')
      ).toBeTruthy();
    });

    test('should trigger the initialize method of the child component', async () => {
      expect(childElement.initialize).toHaveBeenCalledOnce();
    });

    test('should update language when language property changes', async () => {
      element.language = 'fr';
      await element.updateComplete;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const context = (element as any).context;
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

    test('should set engine after initialization', async () => {
      await element.initialize(commerceEngineConfig);
      expect(element.engine).toBeTruthy();
    });
  });

  describe('when initialized with existing engine', () => {
    let preconfiguredEngine: ReturnType<typeof buildCommerceEngine>;

    beforeEach(() => {
      preconfiguredEngine = buildCommerceEngine({
        configuration: getSampleCommerceEngineConfiguration(),
      });
    });

    test('should render the component and its children', async () => {
      await addChildElement();
      await element.initializeWithEngine(preconfiguredEngine);
      expect(element.shadowRoot).toBeTruthy();
      expect(
        within(element).queryByShadowText('Child Element Content')
      ).toBeTruthy();
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

    test('should update language when language property changes after initialization', async () => {
      await element.initializeWithEngine(preconfiguredEngine);
      element.language = 'fr';
      await element.updateComplete;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const context = (element as any).context;
      expect(context.state.language).toBe('fr');
    });
  });

  test('should set error when initialization fails', async () => {
    const invalidConfig = {...commerceEngineConfig, organizationId: ''};
    await expect(element.initialize(invalidConfig)).rejects.toThrow();
    expect(element.error).toBeDefined();
  });
});
