import {
  LogLevel,
  Search,
  Unsubscribe,
  UrlManager,
  buildSearch,
  loadQueryActions,
  CommerceEngine,
  CommerceEngineConfiguration,
  buildCommerceEngine,
  buildProductListing,
  ProductListing,
  Context,
  buildContext,
  Summary,
  SearchSummaryState,
  ProductListingSummaryState,
} from '@coveo/headless/commerce';
import {
  Component,
  Prop,
  h,
  Listen,
  Method,
  Watch,
  Element,
  State,
  setNonce,
} from '@stencil/core';
import i18next, {i18n} from 'i18next';
import {InitializeEvent} from '../../../utils/initialization-utils';
import {
  SafeStorage,
  StandaloneSearchBoxData,
  StorageItems,
} from '../../../utils/local-storage-utils';
import {CommonBindings, NonceBindings} from '../../common/interface/bindings';
import {
  BaseAtomicInterface,
  CommonAtomicInterfaceHelper,
} from '../../common/interface/interface-common';
import {
  errorSelector,
  firstSearchExecutedSelector,
  noProductsSelector,
} from '../atomic-commerce-layout/commerce-layout';
import {getAnalyticsConfig} from './analytics-config';
import {AtomicCommerceStore, createAtomicCommerceStore} from './store';

const FirstRequestExecutedFlag = 'firstRequestExecuted';

export type CommerceInitializationOptions = CommerceEngineConfiguration;
export type CommerceBindings = CommonBindings<
  CommerceEngine,
  AtomicCommerceStore,
  HTMLAtomicCommerceInterfaceElement
> &
  NonceBindings;

/**
 * @alpha
 * The `atomic-commerce-interface` component is the parent to all other atomic commerce components in a commerce page
 * (except for `atomic-commerce-recommendation-list`, which must have
 * `atomic-commerce-recommendation-interface` as a parent). It handles the headless commerce engine and localization
 * configurations.
 * @slot default - The default slot where you can add child components to the search box.
 */
@Component({
  tag: 'atomic-commerce-interface',
  styleUrl: 'atomic-commerce-interface.pcss',
  shadow: true,
  assetsDirs: ['lang'],
})
export class AtomicCommerceInterface
  implements BaseAtomicInterface<CommerceEngine>
{
  private urlManager!: UrlManager;
  private searchOrListing!: Search | ProductListing;
  private summary!: Summary<SearchSummaryState | ProductListingSummaryState>;
  private context!: Context;
  private unsubscribeUrlManager: Unsubscribe = () => {};
  private unsubscribeSummary: Unsubscribe = () => {};
  private initialized = false;
  private store: AtomicCommerceStore;
  private commonInterfaceHelper: CommonAtomicInterfaceHelper<CommerceEngine>;

  @Element() public host!: HTMLAtomicCommerceInterfaceElement;

  @State() public error?: Error;

  /**
   * The type of the interface.
   * - 'search': Indicates that the interface is used for Search.
   * - 'product-listing': Indicates that the interface is used for Product listing.
   */
  @Prop({reflect: true, mutable: true}) public type:
    | 'search'
    | 'product-listing' = 'search';

  /**
   * Whether analytics should be enabled.
   */
  @Prop({reflect: true}) public analytics = true;

  /**
   * The severity level of the messages to log in the console.
   */
  @Prop({reflect: true}) public logLevel?: LogLevel;

  /**
   * the commerce interface i18next instance.
   */
  @Prop() public i18n: i18n = i18next.createInstance();

  /**
   * the commerce interface language.
   *
   * Will default to the value set in the Headless engine context if not provided.
   */
  @Prop({reflect: true, mutable: true}) public language?: string;

  /**
   * The commerce interface headless engine.
   */
  @Prop({mutable: true}) public engine?: CommerceEngine;

  /**
   * Whether the state should be reflected in the URL parameters.
   */
  @Prop({reflect: true}) public reflectStateInUrl = true;

  /**
   * The CSS selector for the container where the interface will scroll back to.
   */
  @Prop({reflect: true}) public scrollContainer = 'atomic-commerce-interface';

  /**
   * The language assets path. By default, this will be a relative URL pointing to `./lang`.
   *
   * Example: "/mypublicpath/languages"
   *
   */
  @Prop({reflect: true}) public languageAssetsPath = './lang';

  /**
   * The icon assets path. By default, this will be a relative URL pointing to `./assets`.
   *
   * Example: "/mypublicpath/icons"
   *
   */
  @Prop({reflect: true}) public iconAssetsPath = './assets';

  /**
   * The value to set the [nonce](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/nonce) attribute to on inline script and style elements generated by this interface and its child components.
   * If your application is served with a Content Security Policy (CSP) that doesn't include the `script-src: 'unsafe-inline'` or `style-src: 'unsafe-inline'` directives,
   * you should ensure that your application server generates a new nonce on every page load and uses the generated value to set this prop and serve the corresponding CSP response headers
   * (i.e., script-src 'nonce-<YOUR_GENERATED_NONCE>' and style-src 'nonce-<YOUR_GENERATED_NONCE>').
   * Otherwise you may see console errors such as
   *  - Refused to execute inline script because it violates the following Content Security Policy directive: [...]
   *  - Refused to apply inline style because it violates the following Content Security Policy directive: [...].
   * @example:
   * ```html
   * <script nonce="<YOUR_GENERATED_NONCE>">
   *  import {setNonce} from '@coveo/atomic';
   *  setNonce('<YOUR_GENERATED_NONCE>');
   * </script>
   * ```
   */
  @Prop({reflect: true}) public CspNonce?: string;

  /**
   * A reference clone of the interface i18next instance.
   */
  private i18nClone!: i18n;

  public constructor() {
    this.commonInterfaceHelper = new CommonAtomicInterfaceHelper(
      this,
      'CoveoAtomic'
    );
    this.store = createAtomicCommerceStore(this.type);
  }

  public connectedCallback() {
    this.store.setLoadingFlag(FirstRequestExecutedFlag);
    this.i18nClone = this.i18n.cloneInstance();
    this.i18n.addResourceBundle = (
      lng: string,
      ns: string,
      resources: object,
      deep?: boolean,
      overwrite?: boolean
    ) => this.addResourceBundle(lng, ns, resources, deep, overwrite);
  }

  componentWillLoad() {
    if (this.CspNonce) {
      setNonce(this.CspNonce);
    }
    this.initAriaLive();
  }

  @Watch('analytics')
  public toggleAnalytics() {
    this.commonInterfaceHelper.onAnalyticsChange();
  }

  @Watch('language')
  public updateLanguage() {
    if (!this.commonInterfaceHelper.engineIsCreated(this.engine)) {
      return;
    }
    if (!this.language) {
      return;
    }

    this.context.setLanguage(this.language);
    this.commonInterfaceHelper.onLanguageChange();
  }

  @Watch('iconAssetsPath')
  public updateIconAssetsPath() {
    this.store.set('iconAssetsPath', this.iconAssetsPath);
  }

  public disconnectedCallback() {
    this.unsubscribeUrlManager();
    this.unsubscribeSummary();
    window.removeEventListener('hashchange', this.onHashChange);
  }

  @Listen('atomic/initializeComponent')
  public handleInitialization(event: InitializeEvent) {
    this.commonInterfaceHelper.onComponentInitializing(event);
  }

  @Listen('atomic/scrollToTop')
  public scrollToTop() {
    const scrollContainerElement = document.querySelector(this.scrollContainer);
    if (!scrollContainerElement) {
      this.bindings.engine.logger.warn(
        `Could not find the scroll container with the selector "${this.scrollContainer}". This will prevent UX interactions that require a scroll from working correctly. Please check the CSS selector in the scrollContainer option`
      );
      return;
    }

    scrollContainerElement.scrollIntoView({behavior: 'smooth'});
  }

  /**
   * Initializes the connection with the headless commerce engine using options for accessToken (required), organizationId (required), renewAccessToken, organizationEndpoints (recommended), and platformUrl (deprecated).
   */
  @Method() public initialize(options: CommerceInitializationOptions) {
    return this.internalInitialization(() => this.initEngine(options));
  }

  /**
   * Initializes the connection with an already preconfigured [headless commerce engine](https://docs.coveo.com/en/headless/latest/reference/commerce/), as opposed to the `initialize` method, which will internally create a new commerce engine instance.
   * This bypasses the properties set on the component, such as analytics and language.
   */
  @Method() public initializeWithEngine(engine: CommerceEngine) {
    return this.internalInitialization(() => (this.engine = engine));
  }

  /**
   *
   * Executes the first request after initializing connection to the headless commerce engine.
   */
  @Method() public async executeFirstRequest() {
    if (!this.commonInterfaceHelper.engineIsCreated(this.engine)) {
      return;
    }

    if (!this.initialized) {
      console.error(
        'You have to wait until the "initialize" promise is fulfilled before executing a request.',
        this.host
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

  public get bindings(): CommerceBindings {
    return {
      engine: this.engine!,
      i18n: this.i18n,
      store: this.store,
      interfaceElement: this.host,
      createStyleElement: () => {
        const styleTag = document.createElement('style');
        if (this.CspNonce) {
          styleTag.setAttribute('nonce', this.CspNonce);
        }
        return styleTag;
      },
      createScriptElement: () => {
        const styleTag = document.createElement('script');
        if (this.CspNonce) {
          styleTag.setAttribute('nonce', this.CspNonce);
        }
        return styleTag;
      },
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

  private initAriaLive() {
    if (
      Array.from(this.host.children).some(
        (element) => element.tagName === 'ATOMIC-ARIA-LIVE'
      )
    ) {
      return;
    }
    this.host.prepend(document.createElement('atomic-aria-live'));
  }

  private initUrlManager() {
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

      this.host.classList.toggle(
        noProductsSelector,
        hasNoProductsAfterInitialQuery
      );

      this.host.classList.toggle(errorSelector, hasError);

      this.host.classList.toggle(
        firstSearchExecutedSelector,
        firstRequestExecuted
      );

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

  private async internalInitialization(initEngine: () => void) {
    await this.commonInterfaceHelper.onInitialization(initEngine);

    this.initRequestStatus();
    this.initSummary();
    this.initContext();
    this.initLanguage();
    this.initUrlManager();
    this.initialized = true;
  }

  private addResourceBundle(
    lng: string,
    ns: string,
    resources: object,
    deep?: boolean,
    overwrite?: boolean
  ) {
    return this.i18nClone.addResourceBundle(
      lng,
      ns,
      resources,
      deep,
      overwrite
    );
  }

  public render() {
    return [<slot></slot>];
  }
}
