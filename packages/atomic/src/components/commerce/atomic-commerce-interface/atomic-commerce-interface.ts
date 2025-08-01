import {
  buildCommerceEngine,
  buildContext,
  buildProductListing,
  buildSearch,
  type CommerceEngine,
  type CommerceEngineConfiguration,
  type Context,
  type LogLevel,
  loadConfigurationActions,
  loadQueryActions,
  type ProductListing,
  type ProductListingSummaryState,
  type Search,
  type SearchSummaryState,
  type Summary,
  type Unsubscribe,
  type UrlManager,
} from '@coveo/headless/commerce';
import {provide} from '@lit/context';
import i18next, {type i18n} from 'i18next';
import {type CSSResultGroup, css, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {booleanConverter} from '@/src/converters/boolean-converter';
import {errorGuard} from '@/src/decorators/error-guard';
import {watch} from '@/src/decorators/watch';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {type InitializeEvent, markParentAsReady} from '@/src/utils/init-queue';
import {
  SafeStorage,
  type StandaloneSearchBoxData,
  StorageItems,
} from '@/src/utils/local-storage-utils';
import {ChildrenUpdateCompleteMixin} from '../../../mixins/children-update-complete-mixin';
import {augmentAnalyticsConfigWithAtomicVersion} from '../../common/interface/analytics-config';
import type {CommonBindings} from '../../common/interface/bindings';
import {
  type BaseAtomicInterface,
  InterfaceController,
} from '../../common/interface/interface-controller';
import {bindingsContext} from '../../context/bindings-context';
import {
  type CommerceStore,
  createCommerceStore,
} from '../atomic-commerce-interface/store';
import {
  errorSelector,
  firstSearchExecutedSelector,
  noProductsSelector,
} from '../atomic-commerce-layout/commerce-layout';
import {getAnalyticsConfig} from './analytics-config';

export type CommerceInitializationOptions = CommerceEngineConfiguration;
export type CommerceBindings = CommonBindings<
  CommerceEngine,
  CommerceStore,
  AtomicCommerceInterface
>;

const FirstRequestExecutedFlag = 'firstRequestExecuted';

/**
 * @alpha
 * The `atomic-commerce-interface` component is the parent to all other atomic commerce components in a commerce page
 * (except for `atomic-commerce-recommendation-list`, which must have
 * `atomic-commerce-recommendation-interface` as a parent). It handles the headless commerce engine and localization
 * configurations.
 *
 * @slot default - The default slot where you can add child components to the search box.
 */
@customElement('atomic-commerce-interface')
@withTailwindStyles
export class AtomicCommerceInterface
  extends ChildrenUpdateCompleteMixin(LitElement)
  implements BaseAtomicInterface<CommerceEngine>
{
  public urlManager!: UrlManager;
  public searchOrListing!: Search | ProductListing;
  public summary!: Summary<SearchSummaryState | ProductListingSummaryState>;
  public context!: Context;
  private unsubscribeUrlManager?: Unsubscribe;
  private unsubscribeSummary?: Unsubscribe;
  private initialized = false;
  public store: CommerceStore;
  private interfaceController = new InterfaceController<CommerceEngine>(
    this,
    'CoveoAtomic'
  );

  @state() public error!: Error;

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
   * The type of the interface.
   * - 'search': Indicates that the interface is used for Search.
   * - 'product-listing': Indicates that the interface is used for Product listing.
   */
  @property({type: String, reflect: true}) type: 'search' | 'product-listing' =
    'search';

  /**
   * Whether analytics should be enabled.
   */
  @property({
    type: Boolean,
    converter: booleanConverter,
    reflect: true,
  })
  analytics = true;

  /**
   * The severity level of the messages to log in the console.
   */
  @property({type: String, attribute: 'log-level', reflect: true})
  logLevel?: LogLevel;

  /**
   * The commerce interface i18next instance.
   */
  @property({type: Object}) i18n: i18n;

  /**
   * The commerce interface language.
   *
   * Will default to the value set in the Headless engine context if not provided.
   */
  @property({type: String, attribute: 'language', reflect: true})
  language?: string;

  /**
   * The commerce interface headless engine.
   */
  @property({type: Object}) engine?: CommerceEngine;

  /**
   * Whether the state should be reflected in the URL parameters.
   */
  @property({
    type: Boolean,
    attribute: 'reflect-state-in-url',
    reflect: true,
    converter: booleanConverter,
  })
  reflectStateInUrl = true;

  /**
   * The CSS selector for the container where the interface will scroll back to.
   */
  @property({type: String, attribute: 'scroll-container', reflect: true})
  scrollContainer = 'atomic-commerce-interface';

  /**
   * The language assets path. By default, this will be a relative URL pointing to `./lang`.
   *
   * Example: "/mypublicpath/languages"
   *
   */
  @property({type: String, attribute: 'language-assets-path', reflect: true})
  languageAssetsPath = './lang';

  /**
   * The icon assets path. By default, this will be a relative URL pointing to `./assets`.
   *
   * Example: "/mypublicpath/icons"
   *
   */
  @property({type: String, attribute: 'icon-assets-path', reflect: true})
  iconAssetsPath = './assets';

  private i18Initialized: Promise<void>;

  public constructor() {
    super();
    this.store = createCommerceStore(this.type);
    const {promise, resolve} = Promise.withResolvers<void>();
    this.i18Initialized = promise;
    this.i18n = i18next.createInstance(undefined, resolve);
  }

  public connectedCallback() {
    super.connectedCallback();
    this.store.setLoadingFlag(FirstRequestExecutedFlag);
    this.updateMobileBreakpoint();

    this.addEventListener(
      'atomic/initializeComponent',
      this.handleInitialization as EventListener
    );

    this.addEventListener(
      'atomic/scrollToTop',
      this.scrollToTop as EventListener
    );
  }

  @watch('analytics')
  public toggleAnalytics() {
    this.interfaceController.onAnalyticsChange();
  }

  @watch('language')
  public updateLanguage() {
    if (
      !this.interfaceController.engineIsCreated(this.engine) ||
      !this.language ||
      !this.context
    ) {
      return;
    }

    this.context.setLanguage(this.language);
    return this.interfaceController.onLanguageChange();
  }

  @watch('iconAssetsPath')
  public updateIconAssetsPath(): void {
    this.store.state.iconAssetsPath = this.iconAssetsPath;
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    if (typeof this.unsubscribeUrlManager === 'function') {
      this.unsubscribeUrlManager();
      this.unsubscribeUrlManager = undefined;
    }
    if (typeof this.unsubscribeSummary === 'function') {
      this.unsubscribeSummary();
      this.unsubscribeSummary = undefined;
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

  private updateMobileBreakpoint() {
    const breakpoint = this.querySelector(
      'atomic-commerce-layout'
    )?.mobileBreakpoint;
    if (breakpoint) {
      this.store.state.mobileBreakpoint = breakpoint;
    }
  }

  private handleInitialization = (event: InitializeEvent) => {
    this.interfaceController.onComponentInitializing(event);
  };

  public scrollToTop() {
    const scrollContainerElement = document.querySelector(this.scrollContainer);
    if (!scrollContainerElement) {
      this.bindings.engine.logger.warn(
        `Could not find the scroll container with the selector "${this.scrollContainer}". This will prevent UX interactions that require a scroll from working correctly. Please review the CSS selector in the scrollContainer option`
      );
      return;
    }

    scrollContainerElement.scrollIntoView({behavior: 'smooth'});
  }

  /**
   * Initializes the connection with the headless commerce engine using the specified options.
   */
  public initialize(options: CommerceInitializationOptions) {
    return this.internalInitialization(() => this.initEngine(options));
  }

  /**
   * Initializes the connection with a preconfigured [headless commerce engine](https://docs.coveo.com/en/headless/latest/reference/commerce/), as opposed to the `initialize` method, which internally creates a new commerce engine instance.
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

  @state()
  @provide({context: bindingsContext})
  public bindings: CommerceBindings = {} as CommerceBindings;

  private async internalInitialization(initEngine: () => void) {
    await Promise.all([
      this.interfaceController.onInitialization(initEngine),
      this.i18Initialized,
    ]);
    this.initContext();
    this.updateLanguage();
    this.bindings = this.getBindings();
    markParentAsReady(this);
    this.initRequestStatus();
    this.initSummary();
    this.initLanguage();
    await this.getUpdateComplete();
    this.initUrlManager();
    this.initialized = true;
  }

  private getBindings(): CommerceBindings {
    return {
      engine: this.engine!,
      i18n: this.i18n,
      store: this.store,
      interfaceElement: this as AtomicCommerceInterface,
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

  private initUrlManager() {
    if (!this.reflectStateInUrl) {
      return;
    }
    this.urlManager = this.searchOrListing.urlManager({
      initialState: {fragment: this.fragment},
    });

    this.unsubscribeUrlManager = this.urlManager.subscribe(() => {
      this.updateHash();
    });

    window.addEventListener('hashchange', this.onHashChange);
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

  private initContext() {
    this.context = buildContext(this.engine!);
  }

  private initLanguage() {
    if (!this.language) {
      this.language = this.context.state.language;
    }
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

  private onHashChange = () => {
    this.urlManager.synchronize(this.fragment);
  };

  @errorGuard()
  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-commerce-interface': AtomicCommerceInterface;
  }
}
