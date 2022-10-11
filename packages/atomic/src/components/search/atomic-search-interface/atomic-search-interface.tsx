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
} from '@coveo/headless';
import i18next, {i18n} from 'i18next';
import {InitializeEvent} from '../../../utils/initialization-utils';
import {AtomicStore, createAtomicStore} from './store';
import {getAnalyticsConfig} from './analytics-config';
import {
  SafeStorage,
  StandaloneSearchBoxData,
  StorageItems,
} from '../../../utils/local-storage-utils';
import {
  BaseAtomicInterface,
  CommonAtomicInterfaceHelper,
} from '../../common/interface/interface-common';
import {CommonBindings} from '../../common/interface/bindings';

const FirstSearchExecutedFlag = 'firstSearchExecuted';
export type InitializationOptions = SearchEngineConfiguration;
export type Bindings = CommonBindings<
  SearchEngine,
  AtomicStore,
  HTMLAtomicSearchInterfaceElement
>;

/**
 * The `atomic-search-interface` component is the parent to all other atomic components in a search page. It handles the headless search engine and localization configurations.
 */
@Component({
  tag: 'atomic-search-interface',
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

  /**
   * A list of non-default fields to include in the query results, separated by commas.
   */
  @Prop({reflect: true}) public fieldsToInclude = '';

  /**
   * The search interface [query pipeline](https://docs.coveo.com/en/180/).
   */
  @Prop({reflect: true}) public pipeline?: string;

  /**
   * The search interface [search hub](https://docs.coveo.com/en/1342/).
   */
  @Prop({reflect: true}) public searchHub = 'default';

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

  public constructor() {
    this.initAriaLive();
    this.commonInterfaceHelper = new CommonAtomicInterfaceHelper(
      this,
      'CoveoAtomic'
    );
  }

  public connectedCallback() {
    this.store.setLoadingFlag(FirstSearchExecutedFlag);
    this.updateMobileBreakpoint();
    this.initFieldsToInclude();
  }

  @Watch('searchHub')
  @Watch('pipeline')
  public updateSearchConfiguration() {
    if (!this.commonInterfaceHelper.engineIsCreated(this.engine)) {
      return;
    }

    const {updateSearchConfiguration} = loadSearchConfigurationActions(
      this.engine
    );
    this.engine.dispatch(
      updateSearchConfiguration({
        pipeline: this.pipeline,
        searchHub: this.searchHub,
      })
    );
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

  /**
   * Initializes the connection with the headless search engine using options for `accessToken` (required), `organizationId` (required), `renewAccessToken`, and `platformUrl`.
   */
  @Method() public initialize(options: InitializationOptions) {
    return this.internalInitialization(() => this.initEngine(options));
  }

  /**
   * Initializes the connection with an already preconfigured headless search engine, as opposed to the `initialize` method which will internally create a new search engine instance.
   * This bypasses the properties set on the component, such as analytics, searchHub, pipeline, language, timezone & logLevel.
   */
  @Method() public initializeWithSearchEngine(engine: SearchEngine) {
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
    const {value, analytics} = standaloneSearchBoxData;
    this.engine!.dispatch(updateQuery({q: value}));
    this.engine.executeFirstSearchAfterStandaloneSearchBoxRedirect(analytics);
  }

  public get bindings(): Bindings {
    return {
      engine: this.engine!,
      i18n: this.i18n,
      store: this.store,
      interfaceElement: this.host,
    };
  }

  private initFieldsToInclude() {
    const fields = [...EcommerceDefaultFieldsToInclude];
    if (this.fieldsToInclude) {
      fields.push(
        ...this.fieldsToInclude.split(',').map((field) => field.trim())
      );
    }
    this.store.addFieldsToInclude(fields);

    // TODO: delete v2 when fields-to-include prop on result list removed
    this.store.onChange('fieldsToInclude', () =>
      this.registerFieldsToInclude()
    );
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
      searchHub: this.searchHub,
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

  private initSearchStatus() {
    this.searchStatus = buildSearchStatus(this.engine!);
    this.unsubscribeSearchStatus = this.searchStatus.subscribe(() => {
      const hasNoResultsAfterInitialSearch =
        !this.searchStatus.state.hasResults &&
        this.searchStatus.state.firstSearchExecuted &&
        !this.searchStatus.state.hasError;

      this.host.classList.toggle(
        'atomic-search-interface-no-results',
        hasNoResultsAfterInitialSearch
      );

      this.host.classList.toggle(
        'atomic-search-interface-error',
        this.searchStatus.state.hasError
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
    history.pushState(
      null,
      document.title,
      `#${this.urlManager.state.fragment}`
    );
  }

  private onHashChange = () => {
    this.urlManager.synchronize(this.fragment);
  };

  private async internalInitialization(initEngine: () => void) {
    await this.commonInterfaceHelper.onInitialization(initEngine);
    this.initFieldsToInclude();
    this.initSearchStatus();
    this.initUrlManager();
    this.initialized = true;
  }

  public render() {
    return [
      this.engine && (
        <atomic-relevance-inspector
          bindings={this.bindings}
        ></atomic-relevance-inspector>
      ),
      <slot></slot>,
    ];
  }
}
