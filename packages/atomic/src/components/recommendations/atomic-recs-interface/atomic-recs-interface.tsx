import {LogLevel} from '@coveo/headless';
import {RecommendationEngine} from '@coveo/headless/recommendation';
import {Component, Element, h, Method, Prop, Watch} from '@stencil/core';
import i18next, {i18n, TFunction} from 'i18next';
import {loadGlobalScripts} from '../../../global/global';
import {loadDayjsLocale} from '../../../utils/dayjs-locales';
import {InitializeEvent} from '../../../utils/initialization-utils';
import {CommonBindings} from '../../common/search-interface/bindings';
import {initi18n} from '../../common/search-interface/i18n';
import {BaseAtomicInterface} from '../../common/search-interface/search-interface-common';
import {createAtomicRecsStore} from './store';

const FirstRecommendationExecutedFlag = 'firstRecommendationExecuted';
export type Bindings = CommonBindings<
  RecommendationEngine,
  ReturnType<typeof createAtomicRecsStore>,
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

  @Element() private host!: HTMLAtomicRecsInterfaceElement;
  private hangingComponentsInitialization: InitializeEvent[] = [];
  private i18nPromise!: Promise<TFunction>;
  private store = createAtomicRecsStore();

  public constructor() {
    loadGlobalScripts('CoveoAtomicRecs');
  }

  public connectedCallback() {
    this.i18nPromise = initi18n(this);
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

  render() {
    return <div>Hello from Recs interface</div>;
  }

  private get bindings(): Bindings {
    return {
      engine: this.engine!,
      i18n: this.i18n,
      store: this.store,
      interfaceElement: this.host,
    };
  }

  private initComponents() {
    this.hangingComponentsInitialization.forEach((event) =>
      event.detail(this.bindings)
    );
  }

  private async internalInitialization(initEngine: () => void) {
    if (this.engine) {
      this.engine.logger.warn(
        'The atomic-recs-interface component "initialize" has already been called.',
        this.host
      );
      return;
    }

    this.updateIconAssetsPath();
    initEngine();
    loadDayjsLocale(this.language);
    await this.i18nPromise;
    this.initComponents();
  }
}
