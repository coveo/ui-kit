import {loadFieldActions} from '@coveo/headless/insight';
import {
  Component,
  Element,
  h,
  Listen,
  Method,
  Prop,
  State,
  Watch,
} from '@stencil/core';
import i18next, {i18n} from 'i18next';
import {
  InsightLogLevel,
  InsightEngine,
  InsightEngineConfiguration,
  buildInsightEngine,
  buildInsightResultsPerPage,
  getOrganizationEndpointsInsight,
  PlatformEnvironmentInsight,
} from '..';
import {InitializeEvent} from '../../../utils/initialization-utils';
import {ArrayProp} from '../../../utils/props-utils';
import {CommonBindings} from '../../common/interface/bindings';
import {
  BaseAtomicInterface,
  CommonAtomicInterfaceHelper,
} from '../../common/interface/interface-common';
import {getAnalyticsConfig} from './analytics-config';
import {AtomicInsightStore, createAtomicInsightStore} from './store';

const FirstInsightRequestExecutedFlag = 'firstInsightRequestExecuted';
export type InsightInitializationOptions = InsightEngineConfiguration;
export type InsightBindings = CommonBindings<
  InsightEngine,
  AtomicInsightStore,
  HTMLAtomicInsightInterfaceElement
>;

/**
 * @internal
 */
@Component({
  tag: 'atomic-insight-interface',
  styleUrl: 'atomic-insight-interface.pcss',
  shadow: true,
})
export class AtomicInsightInterface
  implements BaseAtomicInterface<InsightEngine>
{
  private initialized = false;

  @State() public error?: Error;

  /**
   * The service insight interface headless engine.
   */
  @Prop({mutable: true}) public engine?: InsightEngine;
  /**
   * Whether analytics should be enabled.
   */
  @Prop({reflect: true}) public analytics = true;

  /**
   * The service insight interface i18next instance.
   */
  @Prop() public i18n: i18n = i18next.createInstance();
  /**
   * The severity level of the messages to log in the console.
   */
  @Prop({reflect: true}) public logLevel?: InsightLogLevel;
  /**
   * The service insight interface language.
   */
  @Prop({reflect: true}) public language = 'en';

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
  /**
   * A list of non-default fields to include in the query results.
   *
   * Specify the property as an array using a JSON string representation:
   * ```html
   * <atomic-insight-interface fields-to-include='["fieldA", "fieldB"]'></atomic-insight-interface>
   * ```
   */
  @ArrayProp()
  @Prop({mutable: true})
  public fieldsToInclude: string[] | string = '[]';

  /**
   * The number of results per page. By default, this is set to `5`.
   */
  @Prop({reflect: true}) resultsPerPage = 5;

  @Element() public host!: HTMLAtomicInsightInterfaceElement;

  private store = createAtomicInsightStore();
  private commonInterfaceHelper: CommonAtomicInterfaceHelper<InsightEngine>;

  public constructor() {
    this.commonInterfaceHelper = new CommonAtomicInterfaceHelper(
      this,
      'CoveoAtomic'
    );
  }

  public connectedCallback() {
    this.store.setLoadingFlag(FirstInsightRequestExecutedFlag);
  }

  private initResultsPerPage() {
    if (!this.commonInterfaceHelper.engineIsCreated(this.engine)) {
      return;
    }
    buildInsightResultsPerPage(this.bindings.engine, {
      initialState: {numberOfResults: this.resultsPerPage},
    });
  }

  public registerFieldsToInclude() {
    if (this.fieldsToInclude.length) {
      this.engine!.dispatch(
        loadFieldActions(this.engine!).registerFieldsToInclude([
          ...this.fieldsToInclude,
        ])
      );
    }
  }

  /**
   * Returns the unique, organization-specific endpoint(s)
   * @param {string} organizationId
   * @param {'prod'|'hipaa'|'staging'|'dev'} [env=Prod]
   */
  @Method() public async getOrganizationEndpoints(
    organizationId: string,
    env: PlatformEnvironmentInsight = 'prod'
  ) {
    return getOrganizationEndpointsInsight(organizationId, env);
  }

  /**
   * Initializes the connection with the headless insight engine using options for `accessToken` (required), `organizationId` (required), `renewAccessToken`, and `platformUrl`.
   */
  @Method() public initialize(options: InsightInitializationOptions) {
    return this.internalInitialization(() => this.initEngine(options));
  }

  /**
   * Initializes the connection with an already preconfigured headless insight engine.
   *
   */
  @Method() public initializeWithInsightEngine(engine: InsightEngine) {
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
    this.engine.executeFirstSearch();
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

  public get bindings(): InsightBindings {
    return {
      engine: this.engine!,
      i18n: this.i18n,
      store: this.store,
      interfaceElement: this.host,
    };
  }

  private initEngine(options: InsightInitializationOptions) {
    const analyticsConfig = getAnalyticsConfig(options, this.analytics);
    try {
      this.engine = buildInsightEngine({
        configuration: {
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

  private async internalInitialization(initEngine: () => void) {
    await this.commonInterfaceHelper.onInitialization(initEngine);
    this.store.unsetLoadingFlag(FirstInsightRequestExecutedFlag);
    this.initResultsPerPage();
    this.initialized = true;
  }

  render() {
    return (
      this.engine && (
        <host>
          <slot name="full-search"></slot>
          <slot></slot>
        </host>
      )
    );
  }
}
