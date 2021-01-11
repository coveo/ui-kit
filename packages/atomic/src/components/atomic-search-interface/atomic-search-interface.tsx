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
  Event,
  EventEmitter,
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

type SystemToInitialize = keyof AtomicSearchInterface['systemsToInitialize'];

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
  @Prop() logLevel?: LogLevel;
  @Prop() i18n: i18n = i18next.createInstance();
  @Prop({reflect: true}) language = 'en'; // TODO: make watchable and update i18next language on change
  @Prop({mutable: true}) engine?: Engine;
  @State() error?: Error;
  @Event() ready!: EventEmitter;

  private unsubscribe: Unsubscribe = () => {};
  private hangingComponentsInitialization: InitializeEvent[] = [];
  private systemsToInitialize = {
    i18next: false,
    headless: false,
  };

  componentWillLoad() {
    this.i18n
      .use(Backend)
      .init({
        debug: this.logLevel === 'debug',
        lng: this.language,
        fallbackLng: ['en'],
        backend: {
          loadPath: `${getAssetPath('./lang/')}{{lng}}.json`,
        } as BackendOptions,
      })
      .then(() => this.systemInitialized('i18next'));

    if (this.sample) {
      // Mimics calling the async "initialize" method from the DOM
      setTimeout(() => {
        this.initialize(HeadlessEngine.getSampleConfiguration());
      }, 0);
    }
  }

  disconnectedCallback() {
    this.unsubscribe();
  }

  private systemInitialized(system: SystemToInitialize) {
    this.systemsToInitialize[system] = true;
    const allSystemsInitialized = Object.keys(this.systemsToInitialize).every(
      (system) => this.systemsToInitialize[system as SystemToInitialize]
    );

    if (!allSystemsInitialized) {
      return;
    }

    this.hangingComponentsInitialization.forEach((event) =>
      event.detail(this.context)
    );

    this.initSearchParameterManager();
    this.ready.emit();
    this.engine!.dispatch(
      SearchActions.executeSearch(AnalyticsActions.logInterfaceLoad())
    );
  }

  @Method() async initialize(
    options: Pick<
      HeadlessConfigurationOptions,
      'accessToken' | 'organizationId' | 'renewAccessToken' | 'platformUrl'
    >
  ) {
    if (this.engine) {
      this.engine.logger.warn(
        'The atomic-search-interface component has already been initialized.',
        this.host,
        this
      );
      return;
    }

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
      return;
    }

    this.systemInitialized('headless');
  }

  private get context(): InterfaceContext {
    return {engine: this.engine!, i18n: this.i18n};
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
