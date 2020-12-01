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
import {RenderError} from '../../utils/render-utils';
import {InitializeEvent} from '../../utils/initialization-utils';

@Component({
  tag: 'atomic-search-interface',
  shadow: true,
})
export class AtomicSearchInterface {
  @Element() host!: HTMLDivElement;
  @Prop() sample = false;
  @Prop({reflect: true}) pipeline = 'default';
  @Prop({reflect: true}) searchHub = 'default';
  @Prop() logLevel?: LogLevel = 'warn';
  @RenderError() error?: Error;
  @State() engine?: Engine;

  private unsubscribe: Unsubscribe = () => {};
  private hangingComponentsInitialization: InitializeEvent[] = [];
  private initialized = false;

  componentWillLoad() {
    if (this.sample) {
      this.initialize(HeadlessEngine.getSampleConfiguration());
    }
  }

  disconnectedCallback() {
    this.unsubscribe();
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
  }

  private initEngine(config: HeadlessConfigurationOptions) {
    this.engine = new HeadlessEngine({
      configuration: config,
      reducers: searchAppReducers,
      loggerOptions: {
        level: this.logLevel,
      },
    });

    this.hangingComponentsInitialization.forEach((event) =>
      event.detail(this.engine!)
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
    const stateWithoutHashSign = window.location.hash.slice(1);
    const {serialize, deserialize} = buildSearchParameterSerializer();
    const params = deserialize(stateWithoutHashSign);

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
    event.stopPropagation();

    if (this.engine) {
      event.detail(this.engine);
      return;
    }

    this.hangingComponentsInitialization.push(event);
  }

  public render() {
    if (!this.engine) {
      return;
    }

    return [
      <atomic-relevance-inspector
        engine={this.engine}
      ></atomic-relevance-inspector>,
      <slot></slot>,
    ];
  }
}
