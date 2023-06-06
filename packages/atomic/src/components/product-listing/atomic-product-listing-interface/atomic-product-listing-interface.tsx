import {
  EcommerceDefaultFieldsToInclude,
  loadFieldActions,
  getOrganizationEndpoints as getOrganizationEndpointsHeadless,
  PlatformEnvironment,
} from '@coveo/headless';
import {
  LogLevel,
  ProductListingEngineConfiguration,
  ProductListingEngine,
  buildProductListingEngine,
  loadProductListingActions,
} from '@coveo/headless/product-listing';
import {
  Component,
  Prop,
  h,
  Listen,
  Method,
  Watch,
  Element,
  State,
} from '@stencil/core';
import i18next, {i18n} from 'i18next';
import {InitializeEvent} from '../../../utils/initialization-utils';
import {ArrayProp} from '../../../utils/props-utils';
import {CommonBindings} from '../../common/interface/bindings';
import {
  BaseAtomicInterface,
  CommonAtomicInterfaceHelper,
  mismatchedInterfaceAndEnginePropError,
} from '../../common/interface/interface-common';
import {getAnalyticsConfig} from './analytics-config';
import {
  AtomicProductListingStore,
  createAtomicProductListingStore,
} from './store';

const FirstProductListingExecutedFlag = 'firstProductListingExecuted';
export type ProductListingInitializationOptions =
  ProductListingEngineConfiguration;
export type ProductListingBindings = CommonBindings<
  ProductListingEngine,
  AtomicProductListingStore,
  HTMLAtomicProductListingInterfaceElement
>;

/**
 * The `atomic-product-listing-interface` component is the parent to all other atomic components in a product listing page. It handles the headless product listing engine and localization configurations.
 */
@Component({
  tag: 'atomic-product-listing-interface',
  styleUrl: 'atomic-product-listing-interface.pcss',
  shadow: true,
  assetsDirs: ['lang'],
})
export class AtomicProductListingInterface
  implements BaseAtomicInterface<ProductListingEngine>
{
  private initialized = false;
  private store = createAtomicProductListingStore();
  private commonInterfaceHelper: CommonAtomicInterfaceHelper<ProductListingEngine>;

  @Element() public host!: HTMLAtomicProductListingInterfaceElement;

  @State() public error?: Error;
  @State() relevanceInspectorIsOpen = false;

  /**
   * A list of non-default fields to include in the query results.
   *
   * Specify the property as an array using a JSON string representation:
   * ```html
   * <atomic-product-listing-interface fields-to-include='["fieldA", "fieldB"]'></atomic-product-listing-interface>
   * ```
   */
  @ArrayProp()
  @Prop({mutable: true})
  public fieldsToInclude: string[] | string = '[]';

  /**
   * The product listing interface [query pipeline](https://docs.coveo.com/en/180/).
   *
   * If the product listing interface is initialized using [`initializeWithProductListingEngine`](https://docs.coveo.com/en/atomic/latest/reference/components/atomic-product-listing-interface/#initializewithProductListingEngine), the query pipeline should instead be configured in the target engine.
   */
  @Prop({reflect: true, mutable: true}) public pipeline?: string;

  /**
   * The product listing interface [search hub](https://docs.coveo.com/en/1342/).
   *
   * If the product listing interface is initialized using [`initializeWithProductListingEngine`](https://docs.coveo.com/en/atomic/latest/reference/components/atomic-product-listing-interface/#initializewithProductListingEngine, the search hub should instead be configured in the target engine.
   */
  @Prop({reflect: true, mutable: true}) public searchHub?: string;

  /**
   * Whether analytics should be enabled.
   */
  @Prop({reflect: true}) public analytics = true;

  /**
   * The severity level of the messages to log in the console.
   */
  @Prop({reflect: true}) public logLevel?: LogLevel;

  /**
   * The product listing interface i18next instance.
   */
  @Prop() public i18n: i18n = i18next.createInstance();

  /**
   * The product listing interface language.
   */
  @Prop({reflect: true}) public language = 'en';

  /**
   * The product listing interface headless engine.
   */
  @Prop({mutable: true}) public engine?: ProductListingEngine;

  /**
   * The CSS selector for the container where the interface will scroll back to.
   */
  @Prop({reflect: true}) public scrollContainer =
    'atomic-product-listing-interface';

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
   * Whether the relevance inspector shortcut should be enabled for this interface.
   *
   * The relevance inspector can be opened by holding the Alt key (Option on Mac) while over the interface, and performing a double click.
   *
   * The relevance inspector allows to troubleshoot and debug queries.
   */
  @Prop({reflect: true}) public enableRelevanceInspector = true;
  @Prop({reflect: true}) public url = '';

  public constructor() {
    this.initRelevanceInspector();
    this.commonInterfaceHelper = new CommonAtomicInterfaceHelper(
      this,
      'CoveoAtomic'
    );
  }

  public connectedCallback() {
    this.store.setLoadingFlag('firstProductListingExecuted');
    // this.updateMobileBreakpoint();
  }

  componentWillLoad() {
    this.initAriaLive();
    this.initFieldsToInclude();
  }

  @Watch('analytics')
  public toggleAnalytics() {
    if (!this.commonInterfaceHelper.engineIsCreated(this.engine)) {
      return;
    }

    this.commonInterfaceHelper.onAnalyticsChange();
  }

  @Watch('iconAssetsPath')
  public updateIconAssetsPath() {
    this.store.set('iconAssetsPath', this.iconAssetsPath);
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

  @Listen('atomic/relevanceInspector/close')
  public closeRelevanceInspector() {
    this.relevanceInspectorIsOpen = false;
  }

  /**
   * Initializes the connection with the headless product listing engine using options for accessToken (required), organizationId (required), renewAccessToken, organizationEndpoints (recommended), and platformUrl (deprecated).
   */
  @Method() public initialize(options: ProductListingInitializationOptions) {
    return this.internalInitialization(() => this.initEngine(options));
  }

  /**
   * Initializes the connection with an already preconfigured headless product listing engine, as opposed to the `initialize` method which will internally create a new product listing engine instance.
   * This bypasses the properties set on the component, such as analytics, searchHub, pipeline, language, timezone & logLevel.
   */
  @Method() public initializeWithProductListingEngine(
    engine: ProductListingEngine
  ) {
    if (this.pipeline && this.pipeline !== engine.state.pipeline) {
      console.warn(
        mismatchedInterfaceAndEnginePropError(
          'product listing',
          'query pipeline'
        )
      );
    }
    if (this.searchHub && this.searchHub !== engine.state.searchHub) {
      console.warn(
        mismatchedInterfaceAndEnginePropError('product listing', 'search hub')
      );
    }
    return this.internalInitialization(() => (this.engine = engine));
  }

  /**
   *
   * Fecth the product listing and logs the interface load event to analytics, after initializing connection to the headless product listing engine.
   */
  @Method() public async fetchProductListing() {
    if (!this.commonInterfaceHelper.engineIsCreated(this.engine)) {
      return;
    }

    if (!this.initialized) {
      console.error(
        'You have to wait until the "initialize" promise is fulfilled before executing a search.',
        this.host
      );
      return;
    }

    if (!this.url) {
      console.error(
        'You need to set a url to fetch a product listing.',
        this.url
      );
      return;
    }

    this.engine!.dispatch(
      loadProductListingActions(this.engine!).setProductListingUrl({
        url: this.url,
      })
    );

    this.engine!.dispatch(
      loadProductListingActions(this.engine!).fetchProductListing()
    );
  }

  /**
   * Returns the unique, organization-specific endpoint(s)
   * @param {string} organizationId
   * @param {'prod'|'hipaa'|'staging'|'dev'} [env=Prod]
   */
  @Method() public async getOrganizationEndpoints(
    organizationId: string,
    env: PlatformEnvironment = 'prod'
  ) {
    return getOrganizationEndpointsHeadless(organizationId, env);
  }

  public get bindings(): ProductListingBindings {
    return {
      engine: this.engine!,
      i18n: this.i18n,
      store: this.store,
      interfaceElement: this.host,
    };
  }

  private initFieldsToInclude() {
    const fields = EcommerceDefaultFieldsToInclude.concat(this.fieldsToInclude);
    this.store.addFieldsToInclude(fields);
  }

  public registerFieldsToInclude() {
    this.engine?.dispatch(
      loadFieldActions(this.engine!).registerFieldsToInclude(
        this.store.state.fieldsToInclude
      )
    );
  }

  //   private updateMobileBreakpoint() {
  //     const breakpoint = this.host.querySelector(
  //       'atomic-product-listing-layout'
  //     )?.mobileBreakpoint;
  //     if (breakpoint) {
  //       this.store.set('mobileBreakpoint', breakpoint);
  //     }
  //   }

  private initEngine(options: ProductListingInitializationOptions) {
    const analyticsConfig = getAnalyticsConfig(options, this.analytics);
    try {
      this.engine = buildProductListingEngine({
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

  private initRelevanceInspector() {
    if (this.enableRelevanceInspector) {
      this.host.addEventListener('dblclick', (e) => {
        if (e.altKey) {
          this.relevanceInspectorIsOpen = !this.relevanceInspectorIsOpen;
        }
      });
    }
  }

  private async internalInitialization(initEngine: () => void) {
    this.store.setUrl(this.url);
    await this.commonInterfaceHelper.onInitialization(initEngine);
    this.pipeline = this.engine!.state.pipeline;
    this.searchHub = this.engine!.state.searchHub;
    this.store.unsetLoadingFlag(FirstProductListingExecutedFlag);
    this.initialized = true;
  }

  public render() {
    return [this.engine && <slot></slot>];
  }
}
