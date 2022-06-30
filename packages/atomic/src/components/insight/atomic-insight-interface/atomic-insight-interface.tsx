import {LogLevel} from '@coveo/headless';
import {InsightEngine} from '@coveo/headless/insight';
import {
  Component,
  Element,
  h,
  Listen,
  Method,
  Prop,
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

const FirstInsightRequestExecutedFlag = 'firstInsightRequestExecuted';
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
   * Initializes the connection with an already preconfigured headless insight engine.
   *
   */
  @Method() public initializeWithInsightEngine(engine: InsightEngine) {
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

  private async internalInitialization(initEngine: () => void) {
    await this.commonInterfaceHelper.onInitialization(initEngine);
    this.store.unsetLoadingFlag(FirstInsightRequestExecutedFlag);
  }
}
