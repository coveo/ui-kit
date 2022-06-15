import {
  Component,
  Prop,
  h,
  Listen,
  Method,
  Watch,
  Element,
  State,
  getAssetPath,
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
} from '@coveo/headless';
import {Bindings, InitializeEvent} from '../../utils/initialization-utils';
import i18next, {i18n, TFunction} from 'i18next';
import Backend, {BackendOptions} from 'i18next-http-backend';
import {createStore} from '@stencil/store';
import {setCoveoGlobal} from '../../global/environment';
import {
  AtomicStore,
  hasLoadingFlag,
  initialStore,
  setLoadingFlag,
  unsetLoadingFlag,
} from '../../utils/store';
import {getAnalyticsConfig} from './analytics-config';
import {
  SafeStorage,
  StandaloneSearchBoxData,
  StorageItems,
} from '../../utils/local-storage-utils';
import {loadDayjsLocale} from '../../utils/dayjs-locales';

export type InitializationOptions = SearchEngineConfiguration;

const FirstSearchExecutedFlag = 'firstSearchExecuted';

/**
 * The `atomic-search-interface` component is the parent to all other atomic components in a search page. It handles the headless search engine and localization configurations.
 */
@Component({
  tag: 'atomic-search-interface',
  shadow: true,
  assetsDirs: ['lang'],
})
export class AtomicSearchInterface {
  private urlManager!: UrlManager;
  private searchStatus!: SearchStatus;
  private unsubscribeUrlManager: Unsubscribe = () => {};
  private unsubscribeSearchStatus: Unsubscribe = () => {};
  private hangingComponentsInitialization: InitializeEvent[] = [];
  private initialized = false;
  private store = createStore<AtomicStore>(initialStore());
  private i18nPromise!: Promise<TFunction>;

  @Element() private host!: HTMLAtomicSearchInterfaceElement;

  @State() private error?: Error;

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
   * @example
   * America/Montreal
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
   * @example /mypublicpath/languages
   *
   */
  @Prop({reflect: true}) public languageAssetsPath = './lang';

  /**
   * The icon assets path. By default, this will be a relative URL pointing to `./assets`.
   *
   * @example /mypublicpath/icons
   *
   */
  @Prop({reflect: true}) public iconAssetsPath = './assets';

  public constructor() {
    setCoveoGlobal();
  }

  public connectedCallback() {
    this.i18nPromise = this.initI18n();
    setLoadingFlag(this.store, FirstSearchExecutedFlag);
    this.updateMobileBreakpoint();
    this.updateFieldsToInclude();
  }

  private updateFieldsToInclude() {
    const fields = [...EcommerceDefaultFieldsToInclude];
    if (this.fieldsToInclude) {
      this.fieldsToInclude.split(',').map((field) => field.trim());
    }
    this.store.set('fieldsToInclude', fields);
  }

  private updateMobileBreakpoint() {
    const breakpoint = this.host.querySelector(
      'atomic-search-layout'
    )?.mobileBreakpoint;
    if (breakpoint) {
      this.store.set('mobileBreakpoint', breakpoint);
    }
  }

  @Watch('searchHub')
  @Watch('pipeline')
  public updateSearchConfiguration() {
    if (!this.engineIsCreated(this.engine)) {
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
    if (!this.engineIsCreated(this.engine)) {
      return;
    }

    if (!this.analytics) {
      this.engine.disableAnalytics();
      return;
    }

    this.engine.enableAnalytics();
  }

  @Watch('language')
  public updateLanguage() {
    if (!this.engineIsCreated(this.engine)) {
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

    loadDayjsLocale(this.language);
    new Backend(this.i18n.services, this.i18nBackendOptions).read(
      this.language,
      'translation',
      (_, data) => {
        this.i18n.addResourceBundle(
          this.language,
          'translation',
          data,
          true,
          false
        );
        this.i18n.changeLanguage(this.language);
      }
    );
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
    event.preventDefault();
    event.stopPropagation();

    if (this.engine) {
      event.detail(this.bindings);
      return;
    }

    this.hangingComponentsInitialization.push(event);
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
   *
   */
  @Method() public initializeWithSearchEngine(engine: SearchEngine) {
    return this.internalInitialization(() => (this.engine = engine));
  }

  /**
   *
   * Executes the first search and logs the interface load event to analytics, after initializing connection to the headless search engine.
   */
  @Method() public async executeFirstSearch() {
    if (!this.engineIsCreated(this.engine)) {
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

  private engineIsCreated(engine?: SearchEngine): engine is SearchEngine {
    if (!engine) {
      console.error(
        'You have to call "initialize" on the atomic-search-interface component before modifying the props or calling other public methods.',
        this.host
      );
      return false;
    }

    return true;
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
        ...options.search,
        ...searchConfigFromProps,
      };
    }

    return searchConfigFromProps;
  }

  private initI18n() {
    return this.i18n.use(Backend).init({
      debug: this.logLevel === 'debug',
      lng: this.language,
      fallbackLng: 'en',
      backend: this.i18nBackendOptions,
    });
  }

  private get bindings(): Bindings {
    return {
      engine: this.engine!,
      i18n: this.i18n,
      store: this.store,
      interfaceElement: this.host,
    };
  }

  private initComponents() {
    this.hangingComponentsInitialization.forEach((event) =>
      event.detail(this.bindings)
    );
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
        hasLoadingFlag(this.store, FirstSearchExecutedFlag)
      ) {
        unsetLoadingFlag(this.store, FirstSearchExecutedFlag);
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

  public render() {
    if (this.error) {
      return (
        <atomic-component-error
          element={this.host}
          error={this.error}
        ></atomic-component-error>
      );
    }

    return [
      this.engine && (
        <atomic-relevance-inspector
          bindings={this.bindings}
        ></atomic-relevance-inspector>
      ),
      <slot></slot>,
    ];
  }

  private get i18nBackendOptions(): BackendOptions {
    return {
      loadPath: `${getAssetPath(this.languageAssetsPath)}/{{lng}}.json`,
    };
  }

  private async internalInitialization(initEngine: () => void) {
    if (this.engine) {
      this.engine.logger.warn(
        'The atomic-search-interface component "initialize" has already been called.',
        this.host
      );
      return;
    }
    this.updateIconAssetsPath();
    initEngine();
    loadDayjsLocale(this.language);
    await this.i18nPromise;
    this.initComponents();
    this.initSearchStatus();
    this.initUrlManager();
    this.initAriaLive();

    this.initialized = true;
  }
}
