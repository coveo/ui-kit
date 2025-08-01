import * as headless from '@coveo/headless/commerce';
import i18next from 'i18next';
import {html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import {within} from 'shadow-dom-testing-library';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {
  AtomicCommerceRecommendationInterface,
  type CommerceBindings,
} from '@/src/components/commerce/atomic-commerce-recommendation-interface/atomic-commerce-recommendation-interface';
import {createCommerceRecommendationStore} from '@/src/components/commerce/atomic-commerce-recommendation-interface/store';
import {CommonAtomicInterfaceHelper} from '@/src/components/common/interface/interface-common';
import {bindings} from '@/src/decorators/bindings';
import type {InitializableComponent} from '@/src/decorators/types';
import {InitializeBindingsMixin} from '@/src/mixins/bindings-mixin';
import {markParentAsReady} from '@/src/utils/init-queue';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {buildFakeContext} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/context-controller';
import {buildFakeCommerceEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/engine';

vi.mock('i18next', {spy: true});
vi.mock('@coveo/headless/commerce', {spy: true});
vi.mock(
  '@/src/components/commerce/atomic-commerce-recommendation-interface/store',
  {spy: true}
);
vi.mock('@/src/utils/init-queue', {spy: true});

@customElement('test-element')
@bindings()
class TestElement
  extends InitializeBindingsMixin(LitElement)
  implements InitializableComponent<CommerceBindings>
{
  @state()
  public bindings: CommerceBindings = {} as CommerceBindings;
  @state() public error!: Error;

  public initialize() {}

  public render() {
    return html`test-element`;
  }
}

describe('atomic-commerce-recommendation-interface', () => {
  beforeEach(async () => {
    vi.mocked(headless.buildCommerceEngine).mockReturnValue(
      buildFakeCommerceEngine({})
    );

    vi.mocked(headless.buildContext).mockReturnValue(buildFakeContext({}));
  });

  const setupElement = async ({
    analytics,
    iconAssetsPath,
    language, // TODO (KIT-4365): remove this in v4
    languageAssetsPath,
    scrollContainer,
  }: {
    analytics?: boolean;
    iconAssetsPath?: string;
    language?: string;
    languageAssetsPath?: string;
    scrollContainer?: string;
  } = {}) => {
    const element = (await fixture<AtomicCommerceRecommendationInterface>(
      html`<atomic-commerce-recommendation-interface
        ?analytics=${analytics}
        icon-assets-path=${ifDefined(iconAssetsPath)}
        language=${ifDefined(language)}
        language-assets-path=${ifDefined(languageAssetsPath)}
        scroll-container=${ifDefined(scrollContainer)}
      >
      </atomic-commerce-recommendation-interface>`
    )) as AtomicCommerceRecommendationInterface;

    expect(element).toBeInstanceOf(AtomicCommerceRecommendationInterface);
    return element;
  };

  const addChildElement = async <T extends TestElement>(
    element: AtomicCommerceRecommendationInterface,
    tag = 'test-element'
  ) => {
    const childElement = document.createElement(
      tag
    ) as InitializableComponent<CommerceBindings> & T;
    element.appendChild(childElement);

    await childElement.updateComplete;
    expect(childElement).toBeInstanceOf(TestElement);

    return childElement;
  };

  // #constructor
  describe('when created', () => {
    it('should create an instance of CommonAtomicInterfaceHelper', async () => {
      const element = await setupElement();

      // Mocking the CommonAtomicInterfaceHelper class would be complex.
      expect(
        (
          element as unknown as {
            commonInterfaceHelper: CommonAtomicInterfaceHelper<never>;
          }
        ).commonInterfaceHelper
      ).toBeInstanceOf(CommonAtomicInterfaceHelper);
    });

    it('should set #store to the value returned by createCommerceRecommendationStore', async () => {
      const createCommerceRecommendationStoreSpy = vi.mocked(
        createCommerceRecommendationStore
      );

      const element = await setupElement();

      expect(createCommerceRecommendationStoreSpy).toHaveBeenCalledOnce();
      expect(element.store).toBeDefined();
      expect(element.store).toBe(
        createCommerceRecommendationStoreSpy.mock.results[0].value
      );
    });

    it('should set i18n to the value returned by i18next.createInstance', async () => {
      const i18nextCreateInstanceSpy = vi.mocked(i18next.createInstance);

      const element = await setupElement();

      expect(i18nextCreateInstanceSpy).toHaveBeenCalledOnce();
      expect(element.i18n).toBeDefined();
      expect(element.i18n).toBe(i18nextCreateInstanceSpy.mock.results[0].value);
    });
  });

  // #connectedCallback
  describe('when added to the DOM', () => {
    it("should cause CommonAtomicInterfaceHelper.onComponentInitializing to be called when an 'atomic/initializeComponent' event is dispatched", async () => {
      const element = await setupElement();
      const onComponentInitializingSpy = vi.spyOn(
        CommonAtomicInterfaceHelper.prototype,
        'onComponentInitializing'
      );
      const event = new CustomEvent('atomic/initializeComponent');

      element.dispatchEvent(event);

      expect(onComponentInitializingSpy).toHaveBeenCalledExactlyOnceWith(event);
    });

    describe("when an 'atomic/scrollToTop' event is dispatched", () => {
      it('should cause a warning to be logged when no element in the DOM matches the #scrollContainer selector', async () => {
        const element = await setupElement({scrollContainer: 'i-do-not-exist'});
        const warn = vi.fn();
        const engine = buildFakeCommerceEngine({
          implementation: {
            logger: {
              warn,
            } as never,
          },
        });
        await element.initializeWithEngine(engine);
        const event = new CustomEvent('atomic/scrollToTop', {});

        element.dispatchEvent(event);

        expect(warn).toHaveBeenCalledExactlyOnceWith(
          'Could not find the scroll container with the selector "i-do-not-exist". This will prevent UX interactions that require a scroll from working correctly. Please review the CSS selector in the scrollContainer option'
        );
      });

      it('should cause the element matching the scrollContainer selector to be smoothly scrolled into view when possible', async () => {
        const element = await setupElement();
        const scrollIntoViewSpy = vi.spyOn(element, 'scrollIntoView');
        const event = new CustomEvent('atomic/scrollToTop', {});

        element.dispatchEvent(event);

        expect(scrollIntoViewSpy).toHaveBeenCalledExactlyOnceWith({
          behavior: 'smooth',
        });
      });
    });
  });

  // #initializeWithEngine
  describe('#initializeWithEngine', () => {
    it('should dispatch an updateAnalyticsConfiguration action with the correct source and trackingId', async () => {
      const element = await setupElement();
      const engine = buildFakeCommerceEngine({});
      const updateAnalyticsConfigurationMock = vi.fn();
      vi.mocked(headless.loadConfigurationActions).mockReturnValue({
        updateAnalyticsConfiguration: updateAnalyticsConfigurationMock,
      } as unknown as ReturnType<typeof headless.loadConfigurationActions>);

      await element.initializeWithEngine(engine);

      expect(updateAnalyticsConfigurationMock).toHaveBeenCalledExactlyOnceWith({
        trackingId: engine.configuration.analytics.trackingId,
        source: {'@coveo/atomic': '0.0.0'},
      });
    });

    it('should call CommonInterfaceHelper.onInitialization with a function that sets engine', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      const element = await setupElement();
      const engine = buildFakeCommerceEngine({});
      const onInitializationSpy = vi.spyOn(
        CommonAtomicInterfaceHelper.prototype,
        'onInitialization'
      );

      expect(onInitializationSpy).not.toHaveBeenCalled();

      await element.initializeWithEngine(engine);

      expect(onInitializationSpy).toHaveBeenCalledExactlyOnceWith(
        expect.any(Function)
      );

      element.engine = undefined;
      onInitializationSpy.mock.calls[0][0]();

      expect(element.engine).toBe(engine);
    });

    it('should create an atomic-arial-live element when one does not already exist', async () => {
      const element = await setupElement();
      const ariaLiveElement = element.querySelector('atomic-aria-live');

      expect(ariaLiveElement).toBeNull();

      await element.initializeWithEngine(buildFakeCommerceEngine({}));

      expect(element.querySelector('atomic-aria-live')).toBeTruthy();

      await element.initializeWithEngine(buildFakeCommerceEngine({}));

      expect(element.querySelectorAll('atomic-aria-live').length).toBe(1);
    });

    it('should set #context to a new Headless Context controller instance', async () => {
      const buildContextSpy = vi.mocked(headless.buildContext);
      const element = await setupElement();
      const engine = buildFakeCommerceEngine({});

      expect(buildContextSpy).not.toHaveBeenCalled();
      expect(element.context).toBeUndefined();

      await element.initializeWithEngine(engine);

      expect(buildContextSpy).toHaveBeenCalledExactlyOnceWith(engine);
      expect(element.context).toBe(buildContextSpy.mock.results[0].value);
    });

    it('should update the language when language prop is defined', async () => {
      const onLanguageChangeSpy = vi.spyOn(
        CommonAtomicInterfaceHelper.prototype,
        'onLanguageChange'
      );
      const element = await setupElement({language: 'fr'});
      const engine = buildFakeCommerceEngine({});

      expect(element.context).toBeUndefined();
      expect(onLanguageChangeSpy).not.toHaveBeenCalled();

      await element.initializeWithEngine(engine);

      expect(element.context.setLanguage).toHaveBeenCalledExactlyOnceWith('fr');
      expect(onLanguageChangeSpy).toHaveBeenCalledOnce();
    });

    it('should set bindings.engine to engine', async () => {
      const element = await setupElement();
      const engine = buildFakeCommerceEngine({});

      expect(element.bindings.engine).toBeUndefined();

      await element.initializeWithEngine(engine);

      expect(element.bindings.engine).toBe(engine);
    });

    it('should set bindings.i18n to i18n', async () => {
      const element = await setupElement();
      const engine = buildFakeCommerceEngine({});

      expect(element.bindings.i18n).toBeUndefined();

      await element.initializeWithEngine(engine);

      expect(element.bindings.i18n).toBe(element.i18n);
    });

    it('should set bindings.store to store', async () => {
      const element = await setupElement();
      const engine = buildFakeCommerceEngine({});

      expect(element.bindings.store).toBeUndefined();

      await element.initializeWithEngine(engine);

      expect(element.bindings.store).toBe(element.store);
    });

    it('should set bindings.interfaceElement to this', async () => {
      const element = await setupElement();
      const engine = buildFakeCommerceEngine({});

      expect(element.bindings.interfaceElement).toBeUndefined();

      await element.initializeWithEngine(engine);

      expect(element.bindings.interfaceElement).toBe(element);
    });

    it('should set bindings.addAdoptedStyleSheets to a function that adds stylesheets to the adoptedStyleSheets if not already present', async () => {
      const element = await setupElement();
      const engine = buildFakeCommerceEngine({});
      await element.initializeWithEngine(engine);

      expect(element.bindings.addAdoptedStyleSheets).toBeDefined();
      expect(typeof element.bindings.addAdoptedStyleSheets).toBe('function');

      const stylesheet = new CSSStyleSheet({baseURL: '/test'});
      element.bindings.addAdoptedStyleSheets(stylesheet);

      expect(
        (element.getRootNode() as Document)?.adoptedStyleSheets
      ).to.include(stylesheet);

      element.bindings.addAdoptedStyleSheets(stylesheet);

      expect(
        (element.getRootNode() as Document).adoptedStyleSheets
      ).toHaveLength(1);
    });

    it('should call markParentAsReady with this', async () => {
      const markParentAsReadySpy = vi.mocked(markParentAsReady);
      const element = await setupElement();
      const engine = buildFakeCommerceEngine({});

      expect(markParentAsReadySpy).not.toHaveBeenCalled();

      await element.initializeWithEngine(engine);

      expect(markParentAsReadySpy).toHaveBeenCalledExactlyOnceWith(element);
    });

    it('should call CommonAtomicInteraceHelper.onLanguageChange with context.state.language when language prop is undefined', async () => {
      const onLanguageChangeSpy = vi.spyOn(
        CommonAtomicInterfaceHelper.prototype,
        'onLanguageChange'
      );
      const buildContextMock = vi.mocked(headless.buildContext);
      buildContextMock.mockReturnValue(
        buildFakeContext({
          state: {language: 'de'},
          implementation: {},
        })
      );
      const element = await setupElement();
      const engine = buildFakeCommerceEngine({});

      await element.initializeWithEngine(engine);

      expect(element.language).toBeUndefined();
      expect(onLanguageChangeSpy).toHaveBeenCalledExactlyOnceWith('de');
    });

    // TODO (KIT-4365): remove this test in v4
    it('should call CommonInterfaceHelper.onLanguageChange with no argument when language prop is defined', async () => {
      // We're updating attributes before calling #initializeWithEngine; this would console.error.
      vi.spyOn(console, 'error').mockImplementation(() => {});

      const onLanguageChangeSpy = vi.spyOn(
        CommonAtomicInterfaceHelper.prototype,
        'onLanguageChange'
      );
      const buildContextMock = vi.mocked(headless.buildContext);
      buildContextMock.mockReturnValue(
        buildFakeContext({
          state: {language: 'de'},
          implementation: {},
        })
      );
      const element = await setupElement({language: 'fr'});
      const engine = buildFakeCommerceEngine({});

      await element.updateComplete;
      await element.initializeWithEngine(engine);

      expect(element.language).toBe('fr');
      expect(onLanguageChangeSpy).toHaveBeenCalledExactlyOnceWith();
    });
  });

  // #updateLocale
  describe('#updateLocale', () => {
    it('should do nothing when the engine has not been created', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      const element = await setupElement();
      const onLanguageChangeSpy = vi.spyOn(
        CommonAtomicInterfaceHelper.prototype,
        'onLanguageChange'
      );
      const setContextMock = vi.fn();
      vi.mocked(headless.loadContextActions).mockReturnValue({
        setContext: setContextMock,
      } as unknown as ReturnType<typeof headless.loadContextActions>);

      element.updateLocale('fr', 'FR', 'EUR');

      expect(onLanguageChangeSpy).not.toHaveBeenCalled();
      expect(setContextMock).not.toHaveBeenCalled();
    });

    it('should do nothing when context is not defined', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(headless.buildContext).mockReturnValue(undefined as never);
      const element = await setupElement();
      const engine = buildFakeCommerceEngine();
      element.initializeWithEngine(engine);
      const onLanguageChangeSpy = vi.spyOn(
        CommonAtomicInterfaceHelper.prototype,
        'onLanguageChange'
      );
      const setContextMock = vi.fn();
      vi.mocked(headless.loadContextActions).mockReturnValue({
        setContext: setContextMock,
      } as unknown as ReturnType<typeof headless.loadContextActions>);

      element.updateLocale('fr', 'FR', 'EUR');

      expect(onLanguageChangeSpy).not.toHaveBeenCalled();
      expect(setContextMock).not.toHaveBeenCalled();
    });

    describe('when the engine has been created and context is defined', () => {
      let element: AtomicCommerceRecommendationInterface;
      let engine: ReturnType<typeof buildFakeCommerceEngine>;
      let onLanguageChangeSpy: ReturnType<typeof vi.spyOn>;
      let setContextMock: ReturnType<typeof vi.fn>;

      beforeEach(async () => {
        element = await setupElement();
        engine = buildFakeCommerceEngine({});

        await element.initializeWithEngine(engine);

        setContextMock = vi.fn();
        vi.mocked(headless.loadContextActions).mockReturnValue({
          setContext: setContextMock,
        } as unknown as ReturnType<typeof headless.loadContextActions>);
        onLanguageChangeSpy = vi.spyOn(
          CommonAtomicInterfaceHelper.prototype,
          'onLanguageChange'
        );
      });

      it('should call onLanguageChange when language parameter is provided', async () => {
        element.updateLocale('fr');

        expect(onLanguageChangeSpy).toHaveBeenCalledExactlyOnceWith('fr');
      });

      it('should not call onLanguageChange when language parameter is not provided', async () => {
        element.updateLocale(undefined, 'FR', 'EUR');

        expect(onLanguageChangeSpy).not.toHaveBeenCalled();
      });

      it('should load context actions from the engine', async () => {
        element.updateLocale('fr', 'FR', 'EUR');

        expect(
          vi.mocked(headless.loadContextActions)
        ).toHaveBeenCalledExactlyOnceWith(engine);
      });

      it('should dispatch setContext with only the language when only the language parameter is provided', async () => {
        element.updateLocale('fr');

        expect(setContextMock).toHaveBeenCalledExactlyOnceWith({
          ...element.context.state,
          language: 'fr',
        });
      });

      it('should dispatch setContext with only the country when only the country parameter is provided', async () => {
        element.updateLocale(undefined, 'FR');

        expect(setContextMock).toHaveBeenCalledExactlyOnceWith({
          ...element.context.state,
          country: 'FR',
        });
      });

      it('should dispatch setContext with only the currency when only the currency parameter is provided', async () => {
        element.updateLocale(undefined, undefined, 'EUR');

        expect(setContextMock).toHaveBeenCalledExactlyOnceWith({
          ...element.context.state,
          currency: 'EUR',
        });
      });

      it('should dispatch setContext with all values when all parameters are provided', async () => {
        element.updateLocale('fr', 'FR', 'EUR');

        expect(setContextMock).toHaveBeenCalledExactlyOnceWith({
          ...element.context.state,
          language: 'fr',
          country: 'FR',
          currency: 'EUR',
        });
      });
    });
  });

  // #toggleAnalytics
  it('should call CommonInterfaceHelper.onAnalyticsChange when the analytics prop changes', async () => {
    // We're updating attributes before calling #initializeWithEngine; this would console.error.
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const element = await setupElement();
    const onAnalyticsChangeSpy = vi.spyOn(
      CommonAtomicInterfaceHelper.prototype,
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
  it('should set store.state.iconAssetsPath when the iconAssetsPath prop changes', async () => {
    // We're updating attributes before calling #initializeWithEngine; this would console.error.
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const element = await setupElement();

    element.iconAssetsPath = '/new/icon/assets/path';
    await element.updateComplete;

    expect(element.store.state.iconAssetsPath).toBe('/new/icon/assets/path');
  });

  // TODO (KIT-4365): remove these tests in v4
  // #updateLanguage
  describe('when the language prop changes', () => {
    beforeEach(() => {
      // We're updating attributes before calling #initializeWithEngine; this would console.error.
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should do nothing when the engine has not been created', async () => {
      const onLanguageChangeSpy = vi.spyOn(
        CommonAtomicInterfaceHelper.prototype,
        'onLanguageChange'
      );
      const element = await setupElement({language: 'en'});

      element.language = 'fr';
      await element.updateComplete;

      expect(element.context).toBeUndefined();
      expect(onLanguageChangeSpy).not.toHaveBeenCalled();
    });

    it('should do nothing when #language is undefined', async () => {
      const onLanguageChangeSpy = vi.spyOn(
        CommonAtomicInterfaceHelper.prototype,
        'onLanguageChange'
      );
      const element = await setupElement({language: 'en'});

      element.language = undefined;
      await element.updateComplete;

      expect(element.context).toBeUndefined();
      expect(onLanguageChangeSpy).not.toHaveBeenCalled();
    });

    describe('when the engine has been created & #language is defined & #context is defined', () => {
      it('should log a deprecation warning', async () => {
        const element = await setupElement();
        const engine = buildFakeCommerceEngine();
        await element.initializeWithEngine(engine);

        element.language = 'fr';
        await element.updateComplete;

        expect(engine.logger.warn).toHaveBeenCalledExactlyOnceWith(
          'The `language` property will be removed in the next major version of Atomic (v4). Rather than using this property, set the initial language through the engine configuration when calling `initializeWithEngine`, and update the language as needed using the `updateLocale` method.'
        );
      });

      it('should call CommonInterfaceHelper.onLanguageChange with no argument', async () => {
        const element = await setupElement({language: 'en'});
        const engine = buildFakeCommerceEngine({});
        await element.initializeWithEngine(engine);
        const onLanguageChangeSpy = vi.spyOn(
          CommonAtomicInterfaceHelper.prototype,
          'onLanguageChange'
        );

        element.language = 'fr';
        await element.updateComplete;

        expect(onLanguageChangeSpy).toHaveBeenCalledExactlyOnceWith();
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

    it('should remove the atomic/scrollToTop event listener', async () => {
      const element = await setupElement();
      const removeEventListenerSpy = vi.spyOn(element, 'removeEventListener');

      element.remove();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'atomic/scrollToTop',
        expect.any(Function)
      );
    });

    it('should remove the aria-live element', async () => {
      const element = await setupElement();
      const ariaLiveElement = document.createElement('atomic-aria-live');
      element.appendChild(ariaLiveElement);

      expect(element.querySelector('atomic-aria-live')).toBeTruthy();

      element.remove();

      expect(element.querySelector('atomic-aria-live')).toBeFalsy();
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

  // Cursory "integration" test
  it('should provide bindings to its children', async () => {
    const element = await setupElement();
    const childElement = await addChildElement(element);

    const engine = buildFakeCommerceEngine({});
    await element.initializeWithEngine(engine);

    expect(childElement.bindings).toBe(element.bindings);
  });
});
