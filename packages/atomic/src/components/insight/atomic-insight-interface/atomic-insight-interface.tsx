import {LogLevel} from '@coveo/headless';
import {InsightEngine} from '@coveo/headless/insight';
import {Component, Element, h, Method, Prop, Watch} from '@stencil/core';
import i18next, {i18n, TFunction} from 'i18next';
import {loadGlobalScripts} from '@global/global';
import {loadDayjsLocale} from '@utils/dayjs-locales';
import {InitializeEvent} from '@utils/initialization-utils';
import {CommonBindings} from '../../common/interface/bindings';
import {initi18n} from '../../common/interface/i18n';
import {BaseAtomicInterface} from '../../common/interface/interface-common';
import {createAtomicSvcInsightStore} from './store';

const FirstRecommendationExecutedFlag = 'firstInsightRequestExecuted';
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

  @Element() private host!: HTMLAtomicSvcInsightInterfaceElement;
  private hangingComponentsInitialization: InitializeEvent[] = [];
  private i18nPromise!: Promise<TFunction>;
  private store = createAtomicSvcInsightStore();

  public constructor() {
    loadGlobalScripts('CoveoAtomicRecs');
  }

  public connectedCallback() {
    this.i18nPromise = initi18n(this);
    this.store.setLoadingFlag(FirstRecommendationExecutedFlag);
  }

  /**
   * Initializes the connection with an already preconfigured headless insight engine.
   *
   */
  @Method() public initializeWithRecommendationEngine(engine: InsightEngine) {
    return this.internalInitialization(() => (this.engine = engine));
  }

  @Watch('iconAssetsPath')
  public updateIconAssetsPath() {
    this.store.set('iconAssetsPath', this.iconAssetsPath);
  }

  render() {
    return <div>Hello from Svc Insight interface</div>;
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
