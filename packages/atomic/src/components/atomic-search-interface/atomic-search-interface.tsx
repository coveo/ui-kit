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
import {
  InterfaceContext,
  InitializeEvent,
} from '../../utils/initialization-utils';
import i18next, {i18n} from 'i18next';
import Backend, {BackendOptions} from 'i18next-http-backend';

@Component({
  tag: 'atomic-search-interface',
  shadow: true,
  assetsDirs: ['lang'],
})
export class AtomicSearchInterface {
  @Element() host!: HTMLDivElement;
  @Prop() sample = false;
  @Prop({reflect: true}) pipeline = 'default';
  @Prop({reflect: true}) searchHub = 'default';
  @Prop() logLevel?: LogLevel = 'silent';
  @Prop() i18n: i18n = i18next.createInstance();
  @Prop({reflect: true}) lang = 'en'; // TODO: make watchable and update i18next language on change
  @Prop({mutable: true}) engine?: Engine;
  @State() error?: Error;

  private unsubscribe: Unsubscribe = () => {};
  private hangingComponentsInitialization: InitializeEvent[] = [];
  private initialized = false;
  private afterInitializationCallbacks: (() => void)[] = [];

  componentWillLoad() {
    if (this.sample) {
      this.initialize(HeadlessEngine.getSampleConfiguration());
    }

    this.i18n.use(Backend).init({
      debug: this.logLevel === 'debug',
      lng: this.lang,
      fallbackLng: ['en'],
      backend: {
        loadPath: `${getAssetPath('./lang/')}{{lng}}.json`,
      } as BackendOptions,
    });
  }

  disconnectedCallback() {
    this.unsubscribe();
  }

  @Method() async afterInitialization(callback: () => void) {
    if (this.initialized) {
      callback();
      return;
    }
    this.afterInitializationCallbacks.push(callback);
  }

  @Method() async initialize(
    options: Pick<
      HeadlessConfigurationOptions,
      'accessToken' | 'organizationId' | 'renewAccessToken' | 'platformUrl'
    >
  ) {
    if (this.initialized) {
      console.error(
        'The atomic-search-interface component has already been initialized.',
        this.host,
        this
      );
      return;
    }

    this.initEngine({
      ...options,
      search: {
        searchHub: this.searchHub,
        pipeline: this.pipeline,
      },
    });

    this.initialized = true;
    this.afterInitializationCallbacks.forEach((cb) => cb());
  }

  private get context(): InterfaceContext {
    return {engine: this.engine!, i18n: this.i18n};
  }

  private initEngine(config: HeadlessConfigurationOptions) {
    try {
      this.engine = new HeadlessEngine({
        configuration: config,
        reducers: searchAppReducers,
        loggerOptions: {
          level: this.logLevel,
        },
      });
    } catch (error) {
      this.error = error;
      return;
    }

    this.hangingComponentsInitialization.forEach((event) =>
      event.detail(this.context)
    );

    this.hangingComponentsInitialization = [];

    // Waits until the fields are registered asynchronously before triggering a search
    setTimeout(() => {
      this.initSearchParameterManager();

      this.engine!.dispatch(
        SearchActions.executeSearch(AnalyticsActions.logInterfaceLoad())
      );
    }, 0);
  }

  private initSearchParameterManager() {
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

  @Watch('searchHub')
  @Watch('pipeline')
  updateSearchConfiguration() {
    this.engine?.dispatch(
      ConfigurationActions.updateSearchConfiguration({
        pipeline: this.pipeline,
        searchHub: this.searchHub,
      })
    );
  }

  @Listen('atomic/initializeComponent')
  public handleInitialization(event: InitializeEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (this.engine) {
      event.detail(this.context);
      return;
    }

    this.hangingComponentsInitialization.push(event);
  }

  public render() {
    if (this.error) {
      return (
        <atomic-component-error error={this.error}></atomic-component-error>
      );
    }

    return [
      this.engine && (
        <atomic-relevance-inspector
          engine={this.engine}
        ></atomic-relevance-inspector>
      ),
      <slot></slot>,
    ];
  }
}
