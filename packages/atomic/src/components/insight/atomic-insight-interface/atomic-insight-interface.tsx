import {LogLevel} from '@coveo/headless';
import {
  buildInsightEngine,
  InsightEngine,
  InsightEngineConfiguration,
} from '@coveo/headless/insight';
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
import {InitializeEvent} from '@utils/initialization-utils';
import {CommonBindings} from '@components/common/interface/bindings';
import {
  BaseAtomicInterface,
  CommonAtomicInterfaceHelper,
} from '@components/common/interface/interface-common';
import {createAtomicSvcInsightStore} from './store';
import {getAnalyticsConfig} from './analytics-config';

const FirstInsightRequestExecutedFlag = 'firstInsightRequestExecuted';
export type InitializationOptions = InsightEngineConfiguration;
export type Bindings = CommonBindings<
  InsightEngine,
  ReturnType<typeof createAtomicSvcInsightStore>,
  HTMLAtomicSvcInsightInterfaceElement
>;

/**
 * The `atomic-svg-insight-interface` component is the parent to all other atomic components in an service insight panel interface. It handles the headless insight engine and localization configurations.
 *
 * @internal
 */
@Component({
  tag: 'atomic-svc-insight-interface',
  shadow: true,
})
export class AtomicSvcInsightInterface
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
  @Prop({reflect: true}) public logLevel?: LogLevel;
  /**
   * The service insight interface language.
   */
  @Prop({reflect: true}) public language = 'en';

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

  @Element() public host!: HTMLAtomicSvcInsightInterfaceElement;

  private store = createAtomicSvcInsightStore();
  private commonInterfaceHelper: CommonAtomicInterfaceHelper<InsightEngine>;

  public constructor() {
    this.commonInterfaceHelper = new CommonAtomicInterfaceHelper(
      this,
      'CoveoAtomicSvc'
    );
  }

  public connectedCallback() {
    this.store.setLoadingFlag(FirstInsightRequestExecutedFlag);
  }

  /**
   * Initializes the connection with the headless insight engine using options for `accessToken` (required), `organizationId` (required), `renewAccessToken`, and `platformUrl`.
   */
  @Method() public initialize(options: InitializationOptions) {
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

  render() {
    return this.engine && <slot></slot>;
  }

  public get bindings(): Bindings {
    return {
      engine: this.engine!,
      i18n: this.i18n,
      store: this.store,
      interfaceElement: this.host,
    };
  }

  private initEngine(options: InitializationOptions) {
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
  }
}
