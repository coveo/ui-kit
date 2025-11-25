import {
  VERSION as HEADLESS_VERSION,
  loadConfigurationActions,
} from '@coveo/headless';
import {
  buildRecommendationEngine,
  EcommerceDefaultFieldsToInclude,
  loadFieldActions,
  loadRecommendationActions,
  loadSearchConfigurationActions,
  type RecommendationEngine,
  type RecommendationEngineConfiguration,
  type LogLevel as RecsLogLevel,
} from '@coveo/headless/recommendation';
import {provide} from '@lit/context';
import i18next, {type i18n} from 'i18next';
import {html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {bindingsContext} from '@/src/components/common/context/bindings-context';
import {augmentAnalyticsConfigWithAtomicVersion} from '@/src/components/common/interface/analytics-config';
import type {CommonBindings} from '@/src/components/common/interface/bindings';
import {
  type BaseAtomicInterface,
  type InitializeEvent,
  InterfaceController,
} from '@/src/components/common/interface/interface-controller';
import {arrayConverter} from '@/src/converters/array-converter';
import {booleanConverter} from '@/src/converters/boolean-converter';
import {errorGuard} from '@/src/decorators/error-guard';
import {watch} from '@/src/decorators/watch';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {ChildrenUpdateCompleteMixin} from '@/src/mixins/children-update-complete-mixin';
import {waitForAtomicChildrenToBeDefined} from '@/src/utils/custom-element-tags';
import {markParentAsReady} from '@/src/utils/init-queue';
import {getAnalyticsConfig} from './analytics-config';
import {createRecsStore, type RecsStore} from './store';

export type RecsInitializationOptions = RecommendationEngineConfiguration;
export type RecsBindings = CommonBindings<
  RecommendationEngine,
  RecsStore,
  AtomicRecsInterface
>;

const FirstRecommendationExecutedFlag = 'firstRecommendationExecuted';

const engineConfigurationConflictError = (
  configurationName: 'query pipeline' | 'search hub'
) =>
  `A ${configurationName} is configured on the recommendation interface element, but the recommendation interface was initialized with an engine. You should only configure the ${configurationName} in the target engine.`;

/**
 * The `atomic-recs-interface` component is the parent to all other atomic components in a recommendation interface. It handles the headless recommendation engine and localization configurations.
 * @slot default - The default slot where you can add child components to the recommendation interface.
 */
@customElement('atomic-recs-interface')
@withTailwindStyles
export class AtomicRecsInterface
  extends ChildrenUpdateCompleteMixin(LitElement)
  implements BaseAtomicInterface<RecommendationEngine>
{
  @state()
  @provide({context: bindingsContext})
  public bindings: RecsBindings = {} as RecsBindings;
  @state() public error!: Error;

  private initialized = false;
  private store: RecsStore;
  private i18Initialized: Promise<void>;
  private interfaceController = new InterfaceController<RecommendationEngine>(
    this,
    'CoveoAtomicRecs',
    HEADLESS_VERSION
  );

  /**
   * A list of non-default fields to include in the query results.
   *
   * Specify the property as an array using a JSON string representation:
   * ```html
   * <atomic-recs-interface fields-to-include='["fieldA", "fieldB"]'></atomic-recs-interface>
   * ```
   */
  @property({
    type: Array,
    attribute: 'fields-to-include',
    converter: arrayConverter,
  })
  public fieldsToInclude: string[] = [];

  /**
   * The recommendation interface [query pipeline](https://docs.coveo.com/en/180/).
   *
   * If the recommendation interface is initialized using [`initializeWithRecommendationEngine`](https://docs.coveo.com/en/atomic/latest/reference/recommendation-components/atomic-recs-interface/#initializewithrecommendationengine), the query pipeline should instead be configured in the target engine.
   */
  @property({type: String, reflect: true}) public pipeline?: string;

  /**
   * The recommendation interface [search hub](https://docs.coveo.com/en/1342/).
   *
   * If the recommendation interface is initialized using [`initializeWithRecommendationEngine`](https://docs.coveo.com/en/atomic/latest/reference/recommendation-components/atomic-recs-interface/#initializewithrecommendationengine), the search hub should instead be configured in the target engine.
   */
  @property({type: String, attribute: 'search-hub', reflect: true})
  public searchHub?: string;

  // TODO - KIT-4994: Add disableAnalytics property that defaults to false.

  // TODO - KIT-4994: Deprecate in favor of disableAnalytics property.
  // TODO - (v4) KIT-4990: Remove.
  /**
   * Whether analytics should be enabled.
   */
  @property({
    type: Boolean,
    converter: booleanConverter,
    reflect: true,
  })
  public analytics = true;

  /**
   * The [tz database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) identifier of the time zone to use to correctly interpret dates in the query expression, facets, and result items.
   * By default, the timezone will be [guessed](https://day.js.org/docs/en/timezone/guessing-user-timezone).
   *
   * Example: "America/Montreal"
   */
  @property({type: String, reflect: true}) public timezone?: string;

  /**
   * The minimum severity level of messages to log in the console.
   * Messages with a severity level below this threshold will not be logged.
   * Possible values are `trace`, `debug`, `info`, `warn`, `error`, `fatal`, or `silent`.
   */
  @property({type: String, attribute: 'log-level', reflect: true})
  public logLevel?: RecsLogLevel;

  /**
   * The recommendation interface i18next instance.
   */
  @property({type: Object, attribute: false}) public i18n: i18n;

  /**
   * The recommendation interface language.
   */
  @property({type: String, reflect: true}) public language = 'en';

  /**
   * The headless recommendation engine.
   */
  @property({type: Object, attribute: false})
  public engine?: RecommendationEngine;

  /**
   * The language assets path. By default, this will be a relative URL pointing to `./lang`.
   *
   * Example: "/mypublicpath/languages"
   *
   */
  @property({type: String, attribute: 'language-assets-path', reflect: true})
  public languageAssetsPath = './lang';

  /**
   * The icon assets path. By default, this will be a relative URL pointing to `./assets`.
   *
   * Example: "/mypublicpath/icons"
   *
   */
  @property({type: String, attribute: 'icon-assets-path', reflect: true})
  public iconAssetsPath = './assets';

  public constructor() {
    super();
    this.store = createRecsStore();
    const {promise, resolve} = Promise.withResolvers<void>();
    this.i18Initialized = promise;
    this.i18n = i18next.createInstance(undefined, resolve);
  }

  public connectedCallback() {
    super.connectedCallback();
    this.store.setLoadingFlag(FirstRecommendationExecutedFlag);
    this.initFieldsToInclude();

    this.addEventListener(
      'atomic/initializeComponent',
      this.handleInitialization as EventListener
    );
  }

  public willUpdate(changedProperties: Map<string, unknown>) {
    super.willUpdate(changedProperties);

    if (changedProperties.has('fieldsToInclude')) {
      this.updateFieldsToInclude();
    }
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener(
      'atomic/initializeComponent',
      this.handleInitialization as EventListener
    );
  }

  /**
   * Initializes the connection with the headless recommendation engine using options for `accessToken` (required), `organizationId` (required), `environment` (defaults to `prod`), and `renewAccessToken`.
   */
  public initialize(options: RecsInitializationOptions) {
    return this.internalInitialization(() => this.initEngine(options));
  }
  /**
   * Initializes the interface using the provided [headless recommendation engine](https://docs.coveo.com/en/headless/latest/reference/modules/Recommendation.html), as opposed to the `initialize` method which internally builds a recommendation engine instance.
   * This bypasses the properties set on the component, such as analytics, searchHub, pipeline, language, timezone, and logLevel.
   */
  public initializeWithRecommendationEngine(engine: RecommendationEngine) {
    if (this.pipeline && this.pipeline !== engine.state.pipeline) {
      console.warn(engineConfigurationConflictError('query pipeline'));
    }
    if (this.searchHub && this.searchHub !== engine.state.searchHub) {
      console.warn(engineConfigurationConflictError('search hub'));
    }

    engine.dispatch(
      loadConfigurationActions(engine).updateAnalyticsConfiguration({
        ...augmentAnalyticsConfigWithAtomicVersion(),
      })
    );
    return this.internalInitialization(() => {
      this.engine = engine;
    });
  }

  /**
   *
   * Executes the first request after initializing connection to the headless recommendation engine.
   */
  public async getRecommendations() {
    if (!this.interfaceController.engineIsCreated(this.engine)) {
      return;
    }

    if (!this.initialized) {
      console.error(
        'You have to wait until the "initialize" promise is fulfilled before executing a request.',
        this
      );
      return;
    }

    this.engine!.dispatch(
      loadRecommendationActions(this.engine!).getRecommendations()
    );
  }

  public registerFieldsToInclude() {
    this.engine?.dispatch(
      loadFieldActions(this.engine!).registerFieldsToInclude(
        this.store.state.fieldsToInclude
      )
    );
  }

  @watch('analytics')
  public toggleAnalytics() {
    if (!this.interfaceController.engineIsCreated(this.engine)) {
      return;
    }
    this.interfaceController.onAnalyticsChange();
  }

  @watch('language')
  public updateLanguage() {
    if (
      !this.interfaceController.engineIsCreated(this.engine) ||
      !this.language
    ) {
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
    return this.interfaceController.onLanguageChange();
  }

  @watch('iconAssetsPath')
  public updateIconAssetsPath(): void {
    this.store.state.iconAssetsPath = this.iconAssetsPath;
  }

  @errorGuard()
  render() {
    return html`<slot></slot>`;
  }

  private handleInitialization = (event: InitializeEvent) => {
    this.interfaceController.onComponentInitializing(event);
  };

  private getBindings(): RecsBindings {
    return {
      engine: this.engine!,
      i18n: this.i18n,
      store: this.store,
      interfaceElement: this,
    };
  }

  private initEngine(options: RecsInitializationOptions) {
    const analyticsConfig = getAnalyticsConfig(options, this.analytics);
    try {
      this.engine = buildRecommendationEngine({
        configuration: {
          pipeline: this.pipeline,
          searchHub: this.searchHub ?? 'default',
          locale: this.language,
          timezone: this.timezone,
          analytics: analyticsConfig,
          ...options,
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

  private initFieldsToInclude() {
    const fields = EcommerceDefaultFieldsToInclude.concat(this.fieldsToInclude);
    this.store.addFieldsToInclude(fields);
  }

  private updateFieldsToInclude() {
    this.store.state.fieldsToInclude = [];
    this.initFieldsToInclude();
    this.registerFieldsToInclude();
  }

  private async internalInitialization(initEngine: () => void) {
    await Promise.all([
      this.interfaceController.onInitialization(initEngine),
      this.i18Initialized,
    ]);
    this.updateLanguage();
    this.bindings = this.getBindings();
    markParentAsReady(this);
    this.pipeline = this.engine!.state.pipeline;
    this.searchHub = this.engine!.state.searchHub;
    this.store.unsetLoadingFlag(FirstRecommendationExecutedFlag);
    await waitForAtomicChildrenToBeDefined(this);
    await this.getUpdateComplete();
    this.initialized = true;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-recs-interface': AtomicRecsInterface;
  }
}
