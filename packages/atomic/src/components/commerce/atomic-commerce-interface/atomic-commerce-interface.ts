import {
  buildCommerceEngine,
  buildContext,
  buildProductListing,
  buildSearch,
  type CommerceEngine,
  type CommerceEngineConfiguration,
  type Context,
  VERSION as HEADLESS_VERSION,
  type LogLevel,
  loadConfigurationActions,
  loadContextActions,
  loadQueryActions,
  type ProductListing,
  type ProductListingSummaryState,
  type Search,
  type SearchSummaryState,
  type Summary,
  type Unsubscribe,
  type UrlManager,
} from '@coveo/headless/commerce';
import type {CurrencyCodeISO4217} from '@coveo/relay-event-types';
import {provide} from '@lit/context';
import i18next, {type i18n} from 'i18next';
import {type CSSResultGroup, css, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {
  errorSelector,
  firstSearchExecutedSelector,
  noProductsSelector,
} from '@/src/components/commerce//atomic-commerce-layout/commerce-layout';
import {bindingsContext} from '@/src/components/common/context/bindings-context';
import {augmentAnalyticsConfigWithAtomicVersion} from '@/src/components/common/interface/analytics-config';
import type {CommonBindings} from '@/src/components/common/interface/bindings';
import {
  type BaseAtomicInterface,
  InterfaceController,
} from '@/src/components/common/interface/interface-controller';
import {MobileBreakpointController} from '@/src/components/common/layout/mobile-breakpoint-controller';
import {booleanConverter} from '@/src/converters/boolean-converter';
import {errorGuard} from '@/src/decorators/error-guard';
import {watch} from '@/src/decorators/watch';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {ChildrenUpdateCompleteMixin} from '@/src/mixins/children-update-complete-mixin';
import {waitForAtomicChildrenToBeDefined} from '@/src/utils/custom-element-tags';
import {type InitializeEvent, markParentAsReady} from '@/src/utils/init-queue';
import {
  SafeStorage,
  type StandaloneSearchBoxData,
  StorageItems,
} from '@/src/utils/local-storage-utils';
import {getAnalyticsConfig} from './analytics-config';
import {type CommerceStore, createCommerceStore} from './store';

export type CommerceInitializationOptions = CommerceEngineConfiguration;
export type CommerceBindings = CommonBindings<
  CommerceEngine,
  CommerceStore,
  AtomicCommerceInterface
>;

const FirstRequestExecutedFlag = 'firstRequestExecuted';

/**
 * The `atomic-commerce-interface` component is the parent to all other atomic commerce components in a commerce page
 * (except for `atomic-commerce-recommendation-list`, which must have
 * `atomic-commerce-recommendation-interface` as a parent). It handles the headless commerce engine and localization
 * configurations.
 *
 * @slot default - The default slot where you can add child components to the interface.
 */
@customElement('atomic-commerce-interface')
@withTailwindStyles
export class AtomicCommerceInterface
  extends ChildrenUpdateCompleteMixin(LitElement)
  implements BaseAtomicInterface<CommerceEngine>
{
  @state()
  @provide({context: bindingsContext})
  public bindings: CommerceBindings = {} as CommerceBindings;
  @state() public error!: Error;

  public context!: Context;
  public summary!: Summary<SearchSummaryState | ProductListingSummaryState>;
  public urlManager!: UrlManager;
  public searchOrListing!: Search | ProductListing;
  private unsubscribeUrlManager: Unsubscribe = () => {};
  private unsubscribeSummary: Unsubscribe = () => {};
  private initialized = false;
  private store: CommerceStore;
  private i18Initialized: Promise<void>;
  private interfaceController = new InterfaceController<CommerceEngine>(
    this,
    'CoveoAtomic',
    HEADLESS_VERSION
  );

  static styles: CSSResultGroup = [
    css`
      :host {
        height: inherit;
        width: inherit;
        & > slot {
          height: inherit;
        }
      }
    `,
  ];

  /**
   * The type of the interface.
   * - 'search': Indicates that the interface is used for Search.
   * - 'product-listing': Indicates that the interface is used for Product listing.
   */
  @property({type: String, reflect: true}) public type:
    | 'search'
    | 'product-listing' = 'search';

  // TODO - KIT-4994: Add disableAnalytics property that defaults to false.

  // TODO - KIT-4994: Deprecate in favor of disableAnalytics property.
  // TODO - (v4) KIT-4990: Remove.
  /**
   * Whether analytics should be enabled.
   */
  @property({
    type: Boolean,
    converter: booleanConverter,
    reflect: true,
  })
  public analytics = true;

  /**
   * The minimum severity level of messages to log in the console.
   * Messages with a severity level below this threshold will not be logged.
   * Possible values are `trace`, `debug`, `info`, `warn`, `error`, `fatal`, or `silent`.
   */
  @property({type: String, attribute: 'log-level', reflect: true})
  public logLevel?: LogLevel;

  /**
   * The commerce interface i18next instance.
   */
  @property({type: Object, attribute: false}) public i18n: i18n;

  // TODO - (v4) KIT-4365: Remove (or turn into private state attribute)
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
  @property({type: String, reflect: true}) public language?: string;

  /**
   * The commerce interface headless engine.
   */
  @property({type: Object, attribute: false}) public engine?: CommerceEngine;

  // TODO - (v4) KIT-4823: Remove.
  /**
   * Whether the state should be reflected in the URL parameters.
   * @deprecated - replaced by `disable-state-reflection-in-url` (this defaults to `true`, while the replacement defaults to `false`).
   */
  @property({
    type: Boolean,
    attribute: 'reflect-state-in-url',
    reflect: true,
    converter: booleanConverter,
  })
  reflectStateInUrl = true;

  /**
   * Whether to disable state reflection in the URL parameters.
   */
  @property({
    type: Boolean,
    attribute: 'disable-state-reflection-in-url',
    reflect: true,
  })
  disableStateReflectionInUrl = false;

  /**
   * The CSS selector for the container where the interface will scroll back to.
   */
  @property({type: String, attribute: 'scroll-container', reflect: true})
  public scrollContainer = 'atomic-commerce-interface';

  /**
   * The language assets path. By default, this will be a relative URL pointing to `./lang`.
   *
   * Example: "/mypublicpath/languages"
   *
   */
  @property({type: String, attribute: 'language-assets-path', reflect: true})
  public languageAssetsPath = './lang';

  /**
   * The icon assets path. By default, this will be a relative URL pointing to `./assets`.
   *
   * Example: "/mypublicpath/icons"
   *
   */
  @property({type: String, attribute: 'icon-assets-path', reflect: true})
  public iconAssetsPath = './assets';

  public constructor() {
    super();
    this.store = createCommerceStore(this.type);
    new MobileBreakpointController(this, this.store);
    const {promise, resolve} = Promise.withResolvers<void>();
    this.i18Initialized = promise;
    this.i18n = i18next.createInstance(undefined, resolve);
  }

  public connectedCallback() {
    super.connectedCallback();
    this.store.setLoadingFlag(FirstRequestExecutedFlag);

    this.addEventListener(
      'atomic/initializeComponent',
      this.handleInitialization as EventListener
    );

    this.addEventListener(
      'atomic/scrollToTop',
      this.scrollToTop as EventListener
    );
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    if (typeof this.unsubscribeUrlManager === 'function') {
      this.unsubscribeUrlManager();
    }
    if (typeof this.unsubscribeSummary === 'function') {
      this.unsubscribeSummary();
    }
    window.removeEventListener('hashchange', this.onHashChange);
    this.removeEventListener(
      'atomic/initializeComponent',
      this.handleInitialization as EventListener
    );
    this.removeEventListener(
      'atomic/scrollToTop',
      this.scrollToTop as EventListener
    );
  }

  /**
   * Initializes the connection with the headless commerce engine using the specified options.
   */
  public initialize(options: CommerceInitializationOptions) {
    return this.internalInitialization(() => this.initEngine(options));
  }

  /**
   * Initializes the connection with a preconfigured [headless commerce engine](https://docs.coveo.com/en/headless/latest/reference/interfaces/Commerce.CommerceEngine.html), as opposed to the `initialize` method, which internally creates a new commerce engine instance.
   * This bypasses the properties set on the component, such as analytics and language.
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
   *
   * Executes the first request after initializing connection to the headless commerce engine.
   */
  public async executeFirstRequest() {
    if (!this.interfaceController.engineIsCreated(this.engine)) {
      return;
    }

    if (!this.initialized) {
      console.error(
        'You have to wait until the "initialize" promise is fulfilled before executing a request.',
        this
      );
      return;
    }

    if (this.type === 'search') {
      const safeStorage = new SafeStorage();

      const standaloneSearchBoxData =
        safeStorage.getParsedJSON<StandaloneSearchBoxData | null>(
          StorageItems.STANDALONE_SEARCH_BOX_DATA,
          null
        );

      if (!standaloneSearchBoxData) {
        (this.searchOrListing as Search).executeFirstSearch();
        return;
      }

      safeStorage.removeItem(StorageItems.STANDALONE_SEARCH_BOX_DATA);
      const {value} = standaloneSearchBoxData;

      this.engine.dispatch(
        loadQueryActions(this.engine).updateQuery({query: value})
      );
      (this.searchOrListing as Search).executeFirstSearch();
    } else {
      (this.searchOrListing as ProductListing).executeFirstRequest();
    }
  }

  /**
   * Updates the locale settings for the commerce interface and headless commerce
   * engine. Only the provided parameters will be updated.
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
   * interface.updateLocale('fr', 'CA', 'CAD');
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
    if (!this.interfaceController.engineIsCreated(this.engine)) {
      return;
    }
    this.interfaceController.onAnalyticsChange();
  }

  // TODO - (v4) KIT-4365: Remove.
  @watch('language')
  public updateLanguage() {
    if (
      !this.interfaceController.engineIsCreated(this.engine) ||
      !this.language ||
      !this.context
    ) {
      return;
    }

    this.engine.logger.warn(
      'The `language` property will be removed in the next major version of Atomic (v4). Rather than using this property, set the initial language through the engine configuration when calling `initialize` or `initializeWithEngine`, and update the language as needed using the `updateLocale` method.'
    );

    this.context.setLanguage(this.language);

    return this.interfaceController.onLanguageChange();
  }

  @watch('iconAssetsPath')
  public updateIconAssetsPath(): void {
    this.store.state.iconAssetsPath = this.iconAssetsPath;
  }

  @errorGuard()
  render() {
    return html`<slot></slot>`;
  }

  private handleInitialization = (event: InitializeEvent) => {
    this.interfaceController.onComponentInitializing(event);
  };

  private getBindings(): CommerceBindings {
    return {
      engine: this.engine!,
      i18n: this.i18n,
      store: this.store,
      interfaceElement: this,
    };
  }

  private initEngine(options: CommerceInitializationOptions) {
    const analyticsConfig = getAnalyticsConfig(options, this.analytics);
    try {
      this.engine = buildCommerceEngine({
        configuration: {
          ...options,
          analytics: analyticsConfig,
        },
        loggerOptions: {
          level: this.logLevel,
        },
      });
    } catch (error) {
      this.error = error as Error;
      throw error;
    }
  }

  private get fragment() {
    return window.location.hash.slice(1);
  }

  private initContext() {
    this.context = buildContext(this.engine!);
  }

  private initLanguage() {
    if (!this.context || this.language) {
      return;
    }

    this.interfaceController.onLanguageChange(this.context.state.language);
  }

  private initRequestStatus() {
    this.searchOrListing =
      this.type === 'product-listing'
        ? buildProductListing(this.engine!)
        : buildSearch(this.engine!);
  }

  private initSummary() {
    this.summary = this.searchOrListing.summary();

    this.unsubscribeSummary = this.summary.subscribe(() => {
      const {firstRequestExecuted, hasProducts, hasError} = this.summary.state;
      const hasNoProductsAfterInitialQuery =
        firstRequestExecuted && !hasError && !hasProducts;

      this.classList.toggle(noProductsSelector, hasNoProductsAfterInitialQuery);

      this.classList.toggle(errorSelector, hasError);

      this.classList.toggle(firstSearchExecutedSelector, firstRequestExecuted);

      if (firstRequestExecuted) {
        this.store.unsetLoadingFlag(FirstRequestExecutedFlag);
      }
    });
  }

  private initUrlManager() {
    if (this.disableStateReflectionInUrl) {
      return;
    }
    if (!this.reflectStateInUrl) {
      return;
    }

    this.urlManager = this.searchOrListing.urlManager({
      initialState: {fragment: this.fragment},
    });

    this.unsubscribeUrlManager = this.urlManager.subscribe(() =>
      this.updateHash()
    );

    window.addEventListener('hashchange', this.onHashChange);
  }

  private async internalInitialization(initEngine: () => void) {
    await Promise.all([
      this.interfaceController.onInitialization(initEngine),
      this.i18Initialized,
    ]);
    this.initContext();
    this.updateLanguage(); // TODO - (v4) KIT-4365: Remove.
    this.bindings = this.getBindings();
    markParentAsReady(this);
    this.initRequestStatus();
    this.initSummary();
    this.initLanguage();
    await waitForAtomicChildrenToBeDefined(this);
    await this.getUpdateComplete();
    this.initUrlManager();
    this.initialized = true;
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

  private onHashChange = () => {
    this.urlManager.synchronize(this.fragment);
  };

  // TODO - (v4) KIT-4991: Make private.
  public scrollToTop() {
    const scrollContainerElement = document.querySelector(this.scrollContainer);
    if (!scrollContainerElement) {
      console.warn(
        `Could not find the scroll container with the selector "${this.scrollContainer}". This will prevent UX interactions that require a scroll from working correctly. Please review the CSS selector in the scrollContainer option`
      );
      return;
    }

    scrollContainerElement.scrollIntoView({behavior: 'smooth'});
  }

  private updateHash() {
    const newFragment = this.urlManager.state.fragment;

    if (!this.searchOrListing.state.isLoading) {
      history.replaceState(null, document.title, `#${newFragment}`);
      this.bindings.engine.logger.info(`History replaceState #${newFragment}`);

      return;
    }

    history.pushState(null, document.title, `#${newFragment}`);
    this.bindings.engine.logger.info(`History pushState #${newFragment}`);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-commerce-interface': AtomicCommerceInterface;
  }
}
