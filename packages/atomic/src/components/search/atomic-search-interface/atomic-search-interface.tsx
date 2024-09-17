import {
  LogLevel,
  Unsubscribe,
  buildUrlManager,
  UrlManager,
  buildSearchEngine,
  SearchEngine,
  SearchEngineConfiguration,
  SearchStatus,
  buildSearchStatus,
  loadSearchConfigurationActions,
  loadQueryActions,
  EcommerceDefaultFieldsToInclude,
  loadFieldActions,
  getOrganizationEndpoints as getOrganizationEndpointsHeadless,
  PlatformEnvironment,
} from '@coveo/headless';
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
import {ArrayProp} from '../../../utils/props-utils';
import {CommonBindings, NonceBindings} from '../../common/interface/bindings';
import {
  BaseAtomicInterface,
  CommonAtomicInterfaceHelper,
  mismatchedInterfaceAndEnginePropError,
} from '../../common/interface/interface-common';
import {
  errorSelector,
  firstSearchExecutedSelector,
  noResultsSelector,
} from '../atomic-layout/search-layout';
import {getAnalyticsConfig} from './analytics-config';
import {AtomicStore, createAtomicStore} from './store';

const FirstSearchExecutedFlag = 'firstSearchExecuted';
export type InitializationOptions = SearchEngineConfiguration;
export type Bindings = CommonBindings<
  SearchEngine,
  AtomicStore,
  HTMLAtomicSearchInterfaceElement
> &
  NonceBindings;

/**
 * The `atomic-search-interface` component is the parent to all other atomic components in a search page. It handles the headless search engine and localization configurations.
 */
@Component({
  tag: 'atomic-search-interface',
  styleUrl: 'atomic-search-interface.pcss',
  shadow: true,
  assetsDirs: ['lang'],
})
export class AtomicSearchInterface
  implements BaseAtomicInterface<SearchEngine>
{
  private urlManager!: UrlManager;
  private searchStatus!: SearchStatus;
  private unsubscribeUrlManager: Unsubscribe = () => {};
  private unsubscribeSearchStatus: Unsubscribe = () => {};
  private initialized = false;
  private store = createAtomicStore();
  private commonInterfaceHelper: CommonAtomicInterfaceHelper<SearchEngine>;

  @Element() public host!: HTMLAtomicSearchInterfaceElement;

  @State() public error?: Error;
  @State() relevanceInspectorIsOpen = false;

  /**
   * A list of non-default fields to include in the query results.
   *
   * Specify the property as an array using a JSON string representation:
   * ```html
   * <atomic-search-interface fields-to-include='["fieldA", "fieldB"]'></atomic-search-interface>
   * ```
   */
  @ArrayProp()
  @Prop({mutable: true})
  public fieldsToInclude: string[] | string = '[]';

  /**
   * The search interface [query pipeline](https://docs.coveo.com/en/180/).
   *
   * If the search interface is initialized using [`initializeWithSearchEngine`](https://docs.coveo.com/en/atomic/latest/reference/components/atomic-search-interface/#initializewithsearchengine), the query pipeline should instead be configured in the target engine.
   */
  @Prop({reflect: true, mutable: true}) public pipeline?: string;

  /**
   * The search interface [search hub](https://docs.coveo.com/en/1342/).
   *
   * If the search interface is initialized using [`initializeWithSearchEngine`](https://docs.coveo.com/en/atomic/latest/reference/components/atomic-search-interface/#initializewithsearchengine, the search hub should instead be configured in the target engine.
   */
  @Prop({reflect: true, mutable: true}) public searchHub?: string;

  /**
   * Whether analytics should be enabled.
   */
  @Prop({reflect: true}) public analytics = true;

  /**
   * The [tz database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) identifier of the time zone to use to correctly interpret dates in the query expression, facets, and result items.
   * By default, the timezone will be [guessed](https://day.js.org/docs/en/timezone/guessing-user-timezone).
   *
   * Example: "America/Montreal"
   */
  @Prop({reflect: true}) public timezone?: string;

  /**
   * The severity level of the messages to log in the console.
   */
  @Prop({reflect: true}) public logLevel?: LogLevel;

  /**
   * The search interface i18next instance.
   */
  @Prop() public i18n: i18n = i18next.createInstance();

  /**
   * The search interface language.
   */
  @Prop({reflect: true}) public language = 'en';

  /**
   * The search interface headless engine.
   */
  @Prop({mutable: true}) public engine?: SearchEngine;

  /**
   * Whether the state should be reflected in the URL parameters.
   */
  @Prop({reflect: true}) public reflectStateInUrl = true;

  /**
   * The CSS selector for the container where the interface will scroll back to.
   */
  @Prop({reflect: true}) public scrollContainer = 'atomic-search-interface';

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
   * A reference clone of the search interface i18next instance.
   */
  private i18nClone!: i18n;

  public constructor() {
    this.initRelevanceInspector();
    this.commonInterfaceHelper = new CommonAtomicInterfaceHelper(
      this,
      'CoveoAtomic'
    );
  }

  public connectedCallback() {
    this.store.setLoadingFlag(FirstSearchExecutedFlag);
    this.updateMobileBreakpoint();
    this.i18nClone = this.i18n.cloneInstance();
    this.i18n.addResourceBundle = (
      lng: string,
      ns: string,
      resources: object,
      deep?: boolean,
      overwrite?: boolean
    ) => this.addResourceBundleWithWarning(lng, ns, resources, deep, overwrite);
  }

  componentWillLoad() {
    if (this.CspNonce) {
      setNonce(this.CspNonce);
    }
    this.initAriaLive();
    this.initFieldsToInclude();
  }

  public updateSearchConfiguration(
    updatedProp: 'searchHub' | 'pipeline',
    newValue: string | undefined
  ) {
    if (!this.commonInterfaceHelper.engineIsCreated(this.engine)) {
      return;
    }

    if (this.engine.state[updatedProp] === newValue) {
      return;
    }

    const {updateSearchConfiguration} = loadSearchConfigurationActions(
      this.engine
    );
    this.engine.dispatch(
      updateSearchConfiguration({
        [updatedProp]: newValue,
      })
    );
  }

  @Watch('searchHub')
  public updateSearchHub() {
    this.updateSearchConfiguration('searchHub', this.searchHub ?? 'default');
  }

  @Watch('pipeline')
  public updatePipeline() {
    this.updateSearchConfiguration('pipeline', this.pipeline);
  }

  @Watch('analytics')
  public toggleAnalytics() {
    if (!this.commonInterfaceHelper.engineIsCreated(this.engine)) {
      return;
    }

    this.commonInterfaceHelper.onAnalyticsChange();
  }

  @Watch('language')
  public updateLanguage() {
    if (!this.commonInterfaceHelper.engineIsCreated(this.engine)) {
      return;
    }

    const {updateSearchConfiguration} = loadSearchConfigurationActions(
      this.engine
    );
    this.engine.dispatch(
      updateSearchConfiguration({
        locale: this.language,
      })
    );
    this.commonInterfaceHelper.onLanguageChange();
  }

  @Watch('iconAssetsPath')
  public updateIconAssetsPath() {
    this.store.set('iconAssetsPath', this.iconAssetsPath);
  }

  public disconnectedCallback() {
    this.unsubscribeUrlManager();
    this.unsubscribeSearchStatus();
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

  @Listen('atomic/relevanceInspector/close')
  public closeRelevanceInspector() {
    this.relevanceInspectorIsOpen = false;
  }

  /**
   * Initializes the connection with the headless search engine using options for accessToken (required), organizationId (required), renewAccessToken, organizationEndpoints (recommended), and platformUrl (deprecated).
   */
  @Method() public initialize(options: InitializationOptions) {
    return this.internalInitialization(() => this.initEngine(options));
  }

  /**
   * Initializes the connection with an already preconfigured [headless search engine](https://docs.coveo.com/en/headless/latest/reference/search/), as opposed to the `initialize` method, which will internally create a new search engine instance.
   * This bypasses the properties set on the component, such as analytics, searchHub, pipeline, language, timezone & logLevel.
   */
  @Method() public initializeWithSearchEngine(engine: SearchEngine) {
    if (this.pipeline && this.pipeline !== engine.state.pipeline) {
      console.warn(
        mismatchedInterfaceAndEnginePropError('search', 'query pipeline')
      );
    }
    if (this.searchHub && this.searchHub !== engine.state.searchHub) {
      console.warn(
        mismatchedInterfaceAndEnginePropError('search', 'search hub')
      );
    }
    return this.internalInitialization(() => (this.engine = engine));
  }

  /**
   *
   * Executes the first search and logs the interface load event to analytics, after initializing connection to the headless search engine.
   */
  @Method() public async executeFirstSearch() {
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

    const safeStorage = new SafeStorage();
    const standaloneSearchBoxData =
      safeStorage.getParsedJSON<StandaloneSearchBoxData | null>(
        StorageItems.STANDALONE_SEARCH_BOX_DATA,
        null
      );

    if (!standaloneSearchBoxData) {
      this.engine.executeFirstSearch();
      return;
    }

    safeStorage.removeItem(StorageItems.STANDALONE_SEARCH_BOX_DATA);
    const {updateQuery} = loadQueryActions(this.engine!);
    const {value, enableQuerySyntax, analytics} = standaloneSearchBoxData;
    this.engine!.dispatch(updateQuery({q: value, enableQuerySyntax}));
    this.engine.executeFirstSearchAfterStandaloneSearchBoxRedirect(analytics);
  }

  /**
   * Returns the unique, organization-specific endpoint(s).
   * @param {string} organizationId
   * @param {'prod'|'hipaa'|'staging'|'dev'} [env=Prod]
   */
  @Method() public async getOrganizationEndpoints(
    organizationId: string,
    env: PlatformEnvironment = 'prod'
  ) {
    return getOrganizationEndpointsHeadless(organizationId, env);
  }

  public get bindings(): Bindings {
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

  private updateMobileBreakpoint() {
    const breakpoint = this.host.querySelector(
      'atomic-search-layout'
    )?.mobileBreakpoint;
    if (breakpoint) {
      this.store.set('mobileBreakpoint', breakpoint);
    }
  }

  private initEngine(options: InitializationOptions) {
    const searchConfig = this.getSearchConfiguration(options);
    const analyticsConfig = getAnalyticsConfig(
      options,
      this.analytics,
      this.store
    );
    try {
      this.engine = buildSearchEngine({
        configuration: {
          ...options,
          search: searchConfig,
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

  private getSearchConfiguration(options: InitializationOptions) {
    const searchConfigFromProps = {
      searchHub: this.searchHub ?? 'default',
      pipeline: this.pipeline,
      locale: this.language,
      timezone: this.timezone,
    };

    if (options.search) {
      return {
        ...searchConfigFromProps,
        ...options.search,
      };
    }

    return searchConfigFromProps;
  }

  private get fragment() {
    return window.location.hash.slice(1);
  }

  private initUrlManager() {
    if (!this.reflectStateInUrl) {
      return;
    }

    this.urlManager = buildUrlManager(this.engine!, {
      initialState: {fragment: this.fragment},
    });

    this.unsubscribeUrlManager = this.urlManager.subscribe(() =>
      this.updateHash()
    );

    window.addEventListener('hashchange', this.onHashChange);
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

  private initSearchStatus() {
    this.searchStatus = buildSearchStatus(this.engine!);
    this.unsubscribeSearchStatus = this.searchStatus.subscribe(() => {
      const hasNoResultsAfterInitialSearch =
        !this.searchStatus.state.hasResults &&
        this.searchStatus.state.firstSearchExecuted &&
        !this.searchStatus.state.hasError;

      this.host.classList.toggle(
        noResultsSelector,
        hasNoResultsAfterInitialSearch
      );

      this.host.classList.toggle(
        errorSelector,
        this.searchStatus.state.hasError
      );

      this.host.classList.toggle(
        firstSearchExecutedSelector,
        this.searchStatus.state.firstSearchExecuted
      );

      if (
        this.searchStatus.state.firstSearchExecuted &&
        this.store.hasLoadingFlag(FirstSearchExecutedFlag)
      ) {
        this.store.unsetLoadingFlag(FirstSearchExecutedFlag);
      }
    });
  }

  private updateHash() {
    const newFragment = this.urlManager.state.fragment;

    if (!this.searchStatus.state.firstSearchExecuted) {
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
    this.pipeline = this.engine!.state.pipeline;
    this.searchHub = this.engine!.state.searchHub;
    this.initSearchStatus();
    this.initUrlManager();
    this.initialized = true;
  }

  private addResourceBundleWithWarning(
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
    return [
      this.engine && this.enableRelevanceInspector && (
        <atomic-relevance-inspector
          open={this.relevanceInspectorIsOpen}
          bindings={this.bindings}
        ></atomic-relevance-inspector>
      ),
      <slot></slot>,
    ];
  }
}
