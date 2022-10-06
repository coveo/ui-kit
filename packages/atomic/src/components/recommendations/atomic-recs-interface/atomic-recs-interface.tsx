import {
  RecommendationEngine,
  RecommendationEngineConfiguration,
  LogLevel,
  loadFieldActions,
  EcommerceDefaultFieldsToInclude,
  buildRecommendationEngine,
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
import {InitializeEvent} from '../../../utils/initialization-utils';
import {CommonBindings} from '../../common/interface/bindings';
import {
  BaseAtomicInterface,
  CommonAtomicInterfaceHelper,
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
 *
 * @internal
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

  @Element() public host!: HTMLAtomicRecsInterfaceElement;

  @State() public error?: Error;

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
   * The recommendation interface headless engine.
   */
  @Prop({mutable: true}) public engine?: RecommendationEngine;

  /**
   * The search interface [query pipeline](https://docs.coveo.com/en/180/).
   */
  @Prop({reflect: true}) public pipeline?: string;

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
  @Prop({reflect: true}) public logLevel?: LogLevel;

  /**
   * The search interface language.
   */
  @Prop({reflect: true}) public language = 'en';

  /**
   * A list of non-default fields to include in the query results, separated by commas.
   */
  @Prop({reflect: true}) public fieldsToInclude = '';

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
   * Initializes the connection with the headless search engine using options for `accessToken` (required), `organizationId` (required), `renewAccessToken`, and `platformUrl`.
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
    return this.internalInitialization(() => (this.engine = engine));
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
    this.commonInterfaceHelper.onLanguageChange();
  }

  @Watch('analytics')
  public toggleAnalytics() {
    this.commonInterfaceHelper.onAnalyticsChange();
  }

  public registerFieldsToInclude() {
    const fields = EcommerceDefaultFieldsToInclude.concat(
      this.fieldsToInclude.split(',').map((field) => field.trim())
    );
    this.engine!.dispatch(
      loadFieldActions(this.engine!).registerFieldsToInclude(fields)
    );
  }

  private async internalInitialization(initEngine: () => void) {
    await this.commonInterfaceHelper.onInitialization(initEngine);
    this.store.unsetLoadingFlag(FirstRecommendationExecutedFlag);
  }

  private initEngine(options: RecsInitializationOptions) {
    const analyticsConfig = getAnalyticsConfig(options, this.analytics);
    try {
      this.engine = buildRecommendationEngine({
        configuration: {
          searchHub: this.searchHub,
          locale: this.language,
          timezone: this.timezone,
          pipeline: this.pipeline,
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
