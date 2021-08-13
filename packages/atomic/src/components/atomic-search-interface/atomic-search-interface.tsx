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
  loadSearchConfigurationActions,
  SearchEngineConfiguration,
} from '@coveo/headless';
import {Bindings, InitializeEvent} from '../../utils/initialization-utils';
import i18next, {i18n} from 'i18next';
import Backend, {BackendOptions} from 'i18next-http-backend';
import {createStore} from '@stencil/store';
import {setCoveoGlobal} from '../../global/environment';
import {AtomicStore, initialStore} from '../../utils/store';

export type InitializationOptions = Pick<
  SearchEngineConfiguration,
  'accessToken' | 'organizationId' | 'renewAccessToken' | 'platformUrl'
>;

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
  private unsubscribeUrlManager: Unsubscribe = () => {};
  private hangingComponentsInitialization: InitializeEvent[] = [];
  private initialized = false;
  private store = createStore<AtomicStore>(initialStore());

  @Element() private host!: HTMLElement;

  @State() private error?: Error;

  /**
   * The search interface [query pipeline](https://docs.coveo.com/en/180/).
   */
  @Prop({reflect: true}) public pipeline = 'default';

  /**
   * The search interface [search hub](https://docs.coveo.com/en/1342/).
   */
  @Prop({reflect: true}) public searchHub = 'default';

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
  @Prop() public logLevel?: LogLevel;

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
  @Prop() public reflectStateInUrl = true;

  /**
   * The CSS selector for the container where the interface will scroll back to.
   */
  @Prop() public scrollContainer = 'atomic-search-interface';

  public constructor() {
    setCoveoGlobal();
  }

  @Watch('searchHub')
  @Watch('pipeline')
  public updateSearchConfiguration() {
    const {updateSearchConfiguration} = loadSearchConfigurationActions(
      this.engine!
    );
    this.engine?.dispatch(
      updateSearchConfiguration({
        pipeline: this.pipeline,
        searchHub: this.searchHub,
      })
    );
  }

  @Watch('language')
  public updateLanguage() {
    const {updateSearchConfiguration} = loadSearchConfigurationActions(
      this.engine!
    );
    this.engine?.dispatch(
      updateSearchConfiguration({
        locale: this.language,
      })
    );

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

  public disconnectedCallback() {
    this.unsubscribeUrlManager();
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
  @Method() public async initialize(options: InitializationOptions) {
    if (this.engine) {
      this.engine.logger.warn(
        'The atomic-search-interface component "initialize" has already been called.',
        this.host
      );
      return;
    }

    this.initEngine(options);
    await this.initI18n();
    this.initComponents();
    this.initUrlManager();

    this.initialized = true;
  }

  /**
   *
   * Executes the first search and logs the interface load event to analytics, after initializing connection to the headless search engine.
   */
  @Method() public async executeFirstSearch() {
    if (!this.engine) {
      console.error(
        'You have to call "initialize" on the atomic-search-interface component before executing a search.',
        this.host
      );
      return;
    }

    if (!this.initialized) {
      console.error(
        'You have to wait until the "initialize" promise is fulfilled before executing a search.',
        this.host
      );
      return;
    }

    this.engine.executeFirstSearch();
  }

  private initEngine(options: InitializationOptions) {
    try {
      this.engine = buildSearchEngine({
        configuration: {
          ...options,
          search: {
            searchHub: this.searchHub,
            pipeline: this.pipeline,
            locale: this.language,
            timezone: this.timezone,
          },
        },
        loggerOptions: {
          level: this.logLevel,
        },
      });
    } catch (error) {
      this.error = error;
      throw error;
    }
  }

  private initI18n() {
    return this.i18n.use(Backend).init({
      debug: this.logLevel === 'debug',
      lng: this.language,
      fallbackLng: ['en'],
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
      loadPath: `${getAssetPath('./lang/')}{{lng}}.json`,
    };
  }
}
