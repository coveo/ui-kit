import {
  buildContext,
  type CommerceEngine,
  type CommerceEngineConfiguration,
  type Context,
  VERSION as HEADLESS_VERSION,
  loadConfigurationActions,
  loadContextActions,
} from '@coveo/headless/commerce';
import type {CurrencyCodeISO4217} from '@coveo/relay-event-types';
import {provide} from '@lit/context';
import i18next, {type i18n} from 'i18next';
import {type CSSResultGroup, css, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {booleanConverter} from '@/src/converters/boolean-converter.js';
import {errorGuard} from '@/src/decorators/error-guard.js';
import {watch} from '@/src/decorators/watch';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {ChildrenUpdateCompleteMixin} from '@/src/mixins/children-update-complete-mixin.js';
import {waitForAtomicChildrenToBeDefined} from '@/src/utils/custom-element-tags';
import {type InitializeEvent, markParentAsReady} from '@/src/utils/init-queue';
import {bindingsContext} from '../../common/context/bindings-context.js';
import {augmentAnalyticsConfigWithAtomicVersion} from '../../common/interface/analytics-config.js';
import type {CommonBindings} from '../../common/interface/bindings.js';
import {
  type BaseAtomicInterface,
  InterfaceController,
} from '../../common/interface/interface-controller.js';
import {
  type CommerceRecommendationStore,
  createCommerceRecommendationStore,
} from './store.js';

export type CommerceInitializationOptions = CommerceEngineConfiguration;
export type CommerceBindings = CommonBindings<
  CommerceEngine,
  CommerceRecommendationStore,
  AtomicCommerceRecommendationInterface
>;

/**
 * The `atomic-commerce-recommendation-interface` component is meant to be used
 * as the parent of one or more `atomic-commerce-recommendation-list`
 * components. It handles the headless engine and localization
 * configurations.
 *
 * @slot default - The default slot where you can add child components to the interface.
 */
@customElement('atomic-commerce-recommendation-interface')
@withTailwindStyles
export class AtomicCommerceRecommendationInterface
  extends ChildrenUpdateCompleteMixin(LitElement)
  implements BaseAtomicInterface<CommerceEngine>
{
  @state()
  @provide({context: bindingsContext})
  public bindings: CommerceBindings = {} as CommerceBindings;
  @state() public error!: Error;
  public context!: Context;
  private store: CommerceRecommendationStore;

  private interfaceController = new InterfaceController<CommerceEngine>(
    this,
    'CoveoAtomic',
    HEADLESS_VERSION
  );

  static styles: CSSResultGroup = [
    css`
      :host {
        display: block;
        height: inherit;
        width: inherit;
        & > slot {
          height: inherit;
        }
      }
      `,
  ];

  /**
   * The commerce interface i18next instance.
   */
  @property({type: Object, attribute: false}) i18n: i18n;

  /**
   * The commerce interface headless engine.
   */
  @property({type: Object, attribute: false}) engine?: CommerceEngine;

  /**
   * The CSS selector for the container the interface will scroll back to.
   */
  @property({type: String, attribute: 'scroll-container', reflect: true})
  scrollContainer: string = 'atomic-commerce-recommendation-interface';

  /**
   * The language assets path. By default, this will be a relative URL pointing to `./lang`.
   *
   * Example: "/mypublicpath/languages"
   *
   */
  @property({type: String, attribute: 'language-assets-path', reflect: true})
  languageAssetsPath: string = './lang';

  /**
   * The icon assets path. By default, this will be a relative URL pointing to `./assets`.
   *
   * Example: "/mypublicpath/icons"
   *
   */
  @property({type: String, attribute: 'icon-assets-path', reflect: true})
  iconAssetsPath: string = './assets';

  // TODO - (v4) KIT-4365: Remove (or more likely turn into private state attribute)
  /**
   * The commerce interface language.
   *
   * Will default to the value set in the Headless engine context if not
   * provided.
   *
   * @deprecated - This property will be removed in the next major version of
   * Atomic (v4). Rather than using this property, set the initial language
   * through the engine configuration when calling `initializeWithEngine`, and
   * update the language as needed using the `updateLocale` method.
   */
  @property({type: String, reflect: true}) language?: string;

  // TODO - KIT-4994: Add disableAnalytics property that defaults to false.

  // TODO - KIT-4994: Deprecate in favor of disableAnalytics property.
  // TODO - (v4) KIT-4990: Remove.
  /**
   * Whether to enable analytics.
   */
  @property({
    type: Boolean,
    converter: booleanConverter,
    reflect: true,
  })
  analytics: boolean = true;
  private i18Initialized: Promise<void>;

  public constructor() {
    super();
    this.store = createCommerceRecommendationStore();
    const {promise, resolve} = Promise.withResolvers<void>();
    this.i18Initialized = promise;
    this.i18n = i18next.createInstance(undefined, resolve);
  }

  public connectedCallback() {
    super.connectedCallback();
    this.addEventListener(
      'atomic/initializeComponent',
      this.handleInitialization as EventListener
    );

    this.addEventListener(
      'atomic/scrollToTop',
      this.scrollToTop as EventListener
    );
  }

  /**
   * Initializes the connection with an already preconfigured [headless commerce engine](https://docs.coveo.com/en/headless/latest/reference/interfaces/Commerce.CommerceEngine.html).
   */
  public initializeWithEngine(engine: CommerceEngine) {
    engine.dispatch(
      loadConfigurationActions(engine).updateAnalyticsConfiguration({
        trackingId: engine.configuration.analytics.trackingId,
        ...augmentAnalyticsConfigWithAtomicVersion(),
      })
    );

    return this.internalInitialization(() => {
      this.engine = engine;
    });
  }

  /**
   * Updates the locale settings for the commerce recommendation interface and
   * headless commerce engine. Only the provided parameters will be updated.
   *
   * Calling this method affects the localization of the interface as well as
   * the catalog configuration being used by the Commerce API. If the resulting
   * language-country-currency combination matches no existing catalog
   * configuration in your Coveo organization, requests made through the
   * commerce engine will start failing.
   *
   * @param language - (Optional) The IETF language code tag (for example, `en`).
   * @param country - (Optional) The ISO-3166-1 country tag (for example, `US`).
   * @param currency - (Optional) The ISO-4217 currency code (for example, `USD`).
   *
   * @example
   * ```typescript
   * recommendationInterface.updateLocale('fr', 'CA', 'CAD');
   * ```
   */
  public updateLocale(
    language?: string,
    country?: string,
    currency?: CurrencyCodeISO4217
  ): void {
    if (
      !this.interfaceController.engineIsCreated(this.engine) ||
      !this.context
    ) {
      return;
    }

    language && this.interfaceController.onLanguageChange(language);

    if (this.isNewLocale(language, country, currency)) {
      const {setContext} = loadContextActions(this.engine);
      this.engine.dispatch(
        setContext({
          ...this.context.state,
          ...(language && {language}),
          ...(country && {country}),
          ...(currency && {currency}),
        })
      );
    }
  }

  @watch('analytics')
  public toggleAnalytics() {
    this.interfaceController.onAnalyticsChange();
  }

  @watch('iconAssetsPath')
  public updateIconAssetsPath() {
    this.store.state.iconAssetsPath = this.iconAssetsPath;
  }

  // TODO - (v4) KIT-4365: Remove.
  @watch('language')
  public async updateLanguage() {
    if (
      !this.interfaceController.engineIsCreated(this.engine) ||
      !this.language ||
      !this.context
    ) {
      return;
    }

    this.engine.logger.warn(
      'The `language` property will be removed in the next major version of Atomic (v4). Rather than using this property, set the initial language through the engine configuration when calling `initializeWithEngine`, and update the language as needed using the `updateLocale` method.'
    );

    this.context.setLanguage(this.language);

    return this.interfaceController.onLanguageChange();
  }

  public disconnectedCallback() {
    super.disconnectedCallback();

    this.removeEventListener(
      'atomic/initializeComponent',
      this.handleInitialization as EventListener
    );
    this.removeEventListener(
      'atomic/scrollToTop',
      this.scrollToTop as EventListener
    );
  }

  @errorGuard()
  render() {
    return html`<slot></slot>`;
  }

  private handleInitialization = (event: InitializeEvent) => {
    this.interfaceController.onComponentInitializing(event);
  };

  private scrollToTop() {
    const scrollContainerElement = document.querySelector(this.scrollContainer);
    if (!scrollContainerElement) {
      this.bindings.engine.logger.warn(
        `Could not find the scroll container with the selector "${this.scrollContainer}". This will prevent UX interactions that require a scroll from working correctly. Please review the CSS selector in the scrollContainer option`
      );
      return;
    }

    scrollContainerElement.scrollIntoView({behavior: 'smooth'});
  }

  private async internalInitialization(initEngine: () => void) {
    await Promise.all([
      this.interfaceController.onInitialization(initEngine),
      this.i18Initialized,
    ]);
    this.initContext();
    this.updateLanguage();
    this.bindings = this.getBindings();
    markParentAsReady(this);
    this.initLanguage();
    await waitForAtomicChildrenToBeDefined(this);
    await this.getUpdateComplete();
  }

  private initContext() {
    this.context = buildContext(this.engine!);
  }

  private getBindings(): CommerceBindings {
    return {
      engine: this.engine!,
      i18n: this.i18n,
      store: this.store,
      interfaceElement: this as AtomicCommerceRecommendationInterface,
    };
  }
  private initLanguage() {
    if (!this.context || this.language) {
      return;
    }

    this.interfaceController.onLanguageChange(this.context.state.language);
  }

  private isNewLocale(language?: string, country?: string, currency?: string) {
    if (!this.context) {
      return false;
    }

    return (
      (language && language !== this.context.state.language) ||
      (country && country !== this.context.state.country) ||
      (currency && currency !== this.context.state.currency)
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-commerce-recommendation-interface': AtomicCommerceRecommendationInterface;
  }
}
