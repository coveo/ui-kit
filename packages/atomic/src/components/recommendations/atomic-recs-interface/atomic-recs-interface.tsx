import {
  RecommendationEngine,
  RecommendationEngineConfiguration,
  loadFieldActions,
  EcommerceDefaultFieldsToInclude,
  buildRecommendationEngine,
  loadRecommendationActions,
  loadSearchConfigurationActions,
  getOrganizationEndpoints as getOrganizationEndpointsHeadless,
  PlatformEnvironment,
} from '@coveo/headless/recommendation';
import {
  Component,
  Element,
  h,
  Listen,
  Method,
  Prop,
  Watch,
  State,
} from '@stencil/core';
import i18next, {i18n} from 'i18next';
import {RecsLogLevel} from '..';
import {InitializeEvent} from '../../../utils/initialization-utils';
import {ArrayProp} from '../../../utils/props-utils';
import {CommonBindings} from '../../common/interface/bindings';
import {
  BaseAtomicInterface,
  CommonAtomicInterfaceHelper,
  mismatchedInterfaceAndEnginePropError,
} from '../../common/interface/interface-common';
import {getAnalyticsConfig} from './analytics-config';
import {createAtomicRecsStore, AtomicRecsStore} from './store';

const FirstRecommendationExecutedFlag = 'firstRecommendationExecuted';
export type RecsInitializationOptions = RecommendationEngineConfiguration;
export type RecsBindings = CommonBindings<
  RecommendationEngine,
  AtomicRecsStore,
  HTMLAtomicRecsInterfaceElement
>;

/**
 * The `atomic-recs-interface` component is the parent to all other atomic components in a recommendation interface. It handles the headless recommendation engine and localization configurations.
 */
@Component({
  tag: 'atomic-recs-interface',
  shadow: true,
})
export class AtomicRecsInterface
  implements BaseAtomicInterface<RecommendationEngine>
{
  private store = createAtomicRecsStore();
  private commonInterfaceHelper: CommonAtomicInterfaceHelper<RecommendationEngine>;
  private initialized = false;

  @Element() public host!: HTMLAtomicRecsInterfaceElement;

  @State() public error?: Error;

  /**
   * The recommendation interface [query pipeline](https://docs.coveo.com/en/180/).
   *
   * If the recommendation interface is initialized using [`initializeWithRecommendationEngine`](https://docs.coveo.com/en/atomic/latest/reference/recommendation-components/atomic-recs-interface/#initializewithrecommendationengine), the query pipeline should instead be configured in the target engine.
   */
  @Prop({reflect: true, mutable: true}) public pipeline?: string;

  /**
   * The recommendation interface [search hub](https://docs.coveo.com/en/1342/).
   *
   * If the recommendation interface is initialized using [`initializeWithRecommendationEngine`](https://docs.coveo.com/en/atomic/latest/reference/recommendation-components/atomic-recs-interface/#initializewithrecommendationengine), the search hub should instead be configured in the target engine.
   */
  @Prop({reflect: true, mutable: true}) public searchHub?: string;

  /**
   * The [tz database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) identifier of the time zone to use to correctly interpret dates in the query expression, facets, and result items.
   * By default, the timezone will be [guessed](https://day.js.org/docs/en/timezone/guessing-user-timezone).
   *
   * Example: "America/Montreal"
   */
  @Prop({reflect: true}) public timezone?: string;

  /**
   * The recommendation interface headless engine.
   */
  @Prop({mutable: true}) public engine?: RecommendationEngine;

  /**
   * Whether analytics should be enabled.
   */
  @Prop({reflect: true}) public analytics = true;

  /**
   * The recommendation interface i18next instance.
   */
  @Prop() public i18n: i18n = i18next.createInstance();

  /**
   * The severity level of the messages to log in the console.
   */
  @Prop({reflect: true}) public logLevel?: RecsLogLevel;

  /**
   * The recommendation interface language.
   */
  @Prop({reflect: true}) public language = 'en';

  /**
   * A list of non-default fields to include in the query results.
   *
   * Specify the property as an array using a JSON string representation:
   * ```html
   * <atomic-recs-interface fields-to-include='["fieldA", "fieldB"]'></atomic-recs-interface>
   * ```
   */
  @ArrayProp()
  @Prop({mutable: true})
  public fieldsToInclude: string[] | string = '[]';

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
    this.commonInterfaceHelper = new CommonAtomicInterfaceHelper(
      this,
      'CoveoAtomicRecs'
    );
  }

  public get bindings(): RecsBindings {
    return {
      engine: this.engine!,
      i18n: this.i18n,
      store: this.store,
      interfaceElement: this.host,
    };
  }

  public connectedCallback() {
    this.store.setLoadingFlag(FirstRecommendationExecutedFlag);
  }

  /**
   * Initializes the connection with the headless recommendation engine using options for `accessToken` (required), `organizationId` (required), `renewAccessToken`, and `platformUrl`.
   */
  @Method() public initialize(options: RecsInitializationOptions) {
    return this.internalInitialization(() => this.initEngine(options));
  }

  /**
   * Initializes the connection with an already preconfigured headless recommendation engine.
   * This bypasses the properties set on the component, such as analytics, recommendation, searchHub, language, timezone & logLevel.
   */
  @Method() public initializeWithRecommendationEngine(
    engine: RecommendationEngine
  ) {
    if (this.pipeline && this.pipeline !== engine.state.pipeline) {
      console.warn(
        mismatchedInterfaceAndEnginePropError(
          'recommendation',
          'query pipeline'
        )
      );
    }
    if (this.searchHub && this.searchHub !== engine.state.searchHub) {
      console.warn(
        mismatchedInterfaceAndEnginePropError('recommendation', 'search hub')
      );
    }
    return this.internalInitialization(() => (this.engine = engine));
  }

  /**
   *
   * Fetches new recommendations.
   */
  @Method() public async getRecommendations() {
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

    this.engine!.dispatch(
      loadRecommendationActions(this.engine!).getRecommendations()
    );
  }

  @Method() public async getOrganizationEndpoints(
    organizationId: string,
    env: PlatformEnvironment = 'prod'
  ) {
    return getOrganizationEndpointsHeadless(organizationId, env);
  }

  @Watch('iconAssetsPath')
  public updateIconAssetsPath() {
    this.store.set('iconAssetsPath', this.iconAssetsPath);
  }

  @Listen('atomic/initializeComponent')
  public handleInitialization(event: InitializeEvent) {
    this.commonInterfaceHelper.onComponentInitializing(event);
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

  @Watch('analytics')
  public toggleAnalytics() {
    if (!this.commonInterfaceHelper.engineIsCreated(this.engine)) {
      return;
    }

    this.commonInterfaceHelper.onAnalyticsChange();
  }

  public registerFieldsToInclude() {
    const fields = EcommerceDefaultFieldsToInclude.concat(
      [...this.fieldsToInclude].filter((field) => !!field)
    );
    this.engine!.dispatch(
      loadFieldActions(this.engine!).registerFieldsToInclude(fields)
    );
  }

  private async internalInitialization(initEngine: () => void) {
    await this.commonInterfaceHelper.onInitialization(initEngine);
    this.pipeline = this.engine!.state.pipeline;
    this.searchHub = this.engine!.state.searchHub;
    this.store.unsetLoadingFlag(FirstRecommendationExecutedFlag);
    this.initialized = true;
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

  public render() {
    return this.engine && <slot></slot>;
  }
}
