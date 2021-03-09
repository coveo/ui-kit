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
  HeadlessEngine,
  searchAppReducers,
  Engine,
  SearchActions,
  HeadlessConfigurationOptions,
  AnalyticsActions,
  ConfigurationActions,
  LogLevel,
  buildSearchParameterManager,
  buildSearchParameterSerializer,
  Unsubscribe,
} from '@coveo/headless';
import {Bindings, InitializeEvent} from '../../utils/initialization-utils';
import i18next, {i18n} from 'i18next';
import Backend, {BackendOptions} from 'i18next-http-backend';

export type InitializationOptions = Pick<
  HeadlessConfigurationOptions,
  'accessToken' | 'organizationId' | 'renewAccessToken' | 'platformUrl'
>;

@Component({
  tag: 'atomic-search-interface',
  shadow: true,
  assetsDirs: ['lang'],
})
export class AtomicSearchInterface {
  @Prop() reflectStateInUrl = true;
  private unsubscribe: Unsubscribe = () => {};
  private hangingComponentsInitialization: InitializeEvent[] = [];
  private initialized = false;

  @Element() private host!: HTMLDivElement;

  @State() private error?: Error;

  /**
   * The search interface query pipeline.
   */
  @Prop({reflect: true}) public pipeline = 'default';

  /**
   * The search interface search hub.
   */
  @Prop({reflect: true}) public searchHub = 'default';

  /**
   * The level of messages you want to be logged in the console.
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
   * The search interface Headless engine.
   */
  @Prop({mutable: true}) public engine?: Engine;

  @Watch('searchHub')
  @Watch('pipeline')
  public updateSearchConfiguration() {
    this.engine?.dispatch(
      ConfigurationActions.updateSearchConfiguration({
        pipeline: this.pipeline,
        searchHub: this.searchHub,
      })
    );
  }

  @Watch('language')
  public updateLanguage() {
    this.i18n.changeLanguage(this.language);
  }

  public disconnectedCallback() {
    this.unsubscribe();
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
    this.initSearchParameterManager();

    this.initialized = true;
  }

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

    this.engine.dispatch(
      SearchActions.executeSearch(AnalyticsActions.logInterfaceLoad())
    );
  }

  private initEngine(options: InitializationOptions) {
    try {
      this.engine = new HeadlessEngine({
        configuration: {
          ...options,
          search: {
            searchHub: this.searchHub,
            pipeline: this.pipeline,
          },
        },
        reducers: searchAppReducers,
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
      backend: {
        loadPath: `${getAssetPath('./lang/')}{{lng}}.json`,
      } as BackendOptions,
    });
  }

  private get bindings(): Bindings {
    return {engine: this.engine!, i18n: this.i18n};
  }

  private initComponents() {
    this.hangingComponentsInitialization.forEach((event) =>
      event.detail(this.bindings)
    );
  }

  private initSearchParameterManager() {
    if (this.reflectStateInUrl) {
      const stateWithoutHash = window.location.hash.slice(1);
      const decodedState = decodeURIComponent(stateWithoutHash);
      const {serialize, deserialize} = buildSearchParameterSerializer();
      const params = deserialize(decodedState);

      const manager = buildSearchParameterManager(this.engine!, {
        initialState: {parameters: params},
      });

      this.unsubscribe = manager.subscribe(() => {
        window.location.hash = serialize(manager.state.parameters);
      });
    }
  }

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
          bindings={{engine: this.engine, i18n: this.i18n}}
        ></atomic-relevance-inspector>
      ),
      <slot></slot>,
    ];
  }
}
