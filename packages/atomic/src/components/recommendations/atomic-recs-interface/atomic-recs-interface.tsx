import {LogLevel} from '@coveo/headless';
import {
  buildRecommendationList,
  RecommendationEngine,
} from '@coveo/headless/recommendation';
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
import {InitializeEvent} from '../../../utils/initialization-utils';
import {CommonBindings} from '../../common/interface/bindings';
import {
  BaseAtomicInterface,
  CommonAtomicInterfaceHelper,
} from '../../common/interface/interface-common';
import {createAtomicRecsStore, AtomicRecsStore} from './store';

const FirstRecommendationExecutedFlag = 'firstRecommendationExecuted';
export type Bindings = CommonBindings<
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
  @Prop({reflect: true}) public logLevel?: LogLevel;
  /**
   * The search interface language.
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

  /**
   * The non-localized label for the recommendation interface.
   */
  @Prop({reflect: true}) public label = 'recommendations';
  /**
   * The non-localized label for the recommendation interface.
   */
  @Prop({reflect: true}) public identifier = 'recommendations';

  @Element() public host!: HTMLAtomicRecsInterfaceElement;
  private store = createAtomicRecsStore();
  private commonInterfaceHelper: CommonAtomicInterfaceHelper<RecommendationEngine>;

  public constructor() {
    this.commonInterfaceHelper = new CommonAtomicInterfaceHelper(
      this,
      'CoveoAtomicRecs'
    );
  }

  public connectedCallback() {
    this.store.setLoadingFlag(FirstRecommendationExecutedFlag);
  }

  /**
   * Initializes the connection with an already preconfigured headless recommendation engine.
   *
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
    this.store.unsetLoadingFlag(FirstRecommendationExecutedFlag);
  }
}
