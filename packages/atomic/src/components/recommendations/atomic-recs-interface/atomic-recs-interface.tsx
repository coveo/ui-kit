import {
  RecommendationEngine,
  LogLevel,
  loadFieldActions,
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
   * A list of non-default fields to include in the query results, separated by commas.
   */
  @Prop({reflect: true}) public fieldsToInclude = '';

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

  public registerFieldsToInclude() {
    if (this.fieldsToInclude) {
      this.engine!.dispatch(
        loadFieldActions(this.engine!).registerFieldsToInclude(
          this.fieldsToInclude.split(',').map((field) => field.trim())
        )
      );
    }
  }

  private async internalInitialization(initEngine: () => void) {
    await this.commonInterfaceHelper.onInitialization(initEngine);
    this.store.unsetLoadingFlag(FirstRecommendationExecutedFlag);
  }

  public render() {
    return this.engine && <slot></slot>;
  }
}
