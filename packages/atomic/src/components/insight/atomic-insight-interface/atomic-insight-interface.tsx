import {loadFieldActions} from '@coveo/headless/insight';
import {
  LogLevel as InsightLogLevel,
  InsightEngine,
  InsightEngineConfiguration,
  buildInsightEngine,
  buildResultsPerPage as buildInsightResultsPerPage,
} from '@coveo/headless/insight';
import {
  Component,
  Element,
  h,
  Listen,
  Method,
  Prop,
  setNonce,
  State,
  Watch,
} from '@stencil/core';
import i18next, {i18n} from 'i18next';
import {InitializeEvent} from '../../../utils/initialization-utils';
import {ArrayProp} from '../../../utils/props-utils';
import {CommonBindings, NonceBindings} from '../../common/interface/bindings';
import {
  BaseAtomicInterface,
  CommonAtomicInterfaceHelper,
} from '../../common/interface/interface-common';
import {getAnalyticsConfig} from './analytics-config';
import {createInsightStore, InsightStore} from './store';

const FirstInsightRequestExecutedFlag = 'firstInsightRequestExecuted';
export type InsightInitializationOptions = InsightEngineConfiguration;
export type InsightBindings = CommonBindings<
  InsightEngine,
  InsightStore,
  HTMLAtomicInsightInterfaceElement
> &
  NonceBindings;

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

  /**
   * The value to set the [nonce](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/nonce) attribute to on inline script and style elements generated by this interface and its child components.
   * If your application is served with a Content Security Policy (CSP) that doesn't include the `script-src: 'unsafe-inline'` or `style-src: 'unsafe-inline'` directives,
   * you should ensure that your application server generates a new nonce on every page load and uses the generated value to set this prop and serve the corresponding CSP response headers
   * (i.e., script-src 'nonce-<YOUR_GENERATED_NONCE>' and style-src 'nonce-<YOUR_GENERATED_NONCE>').
   * Otherwise you may see console errors such as
   *  - Refused to execute inline script because it violates the following Content Security Policy directive: [...]
   *  - Refused to apply inline style because it violates the following Content Security Policy directive: [...].
   * When using a nonce, the first import of Atomic should be to import & call the `setNonce` function with the generated nonce value.
   * @example:
   * ```html
   * <script nonce="<YOUR_GENERATED_NONCE>">
   *  import {setNonce} from '@coveo/atomic';
   *  setNonce('<YOUR_GENERATED_NONCE>');
   * </script>
   * ```
   */
  @Prop({reflect: true}) public CspNonce?: string;

  @Element() public host!: HTMLAtomicInsightInterfaceElement;

  private store = createInsightStore();
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

  public componentWillLoad() {
    if (this.CspNonce) {
      setNonce(this.CspNonce);
    }
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
   * Initializes the connection with the headless insight engine using options for `accessToken` (required), `organizationId` (required), `environment` (defaults to `prod`), and `renewAccessToken`.
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
    this.store.state.iconAssetsPath = this.iconAssetsPath;
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
      createStyleElement: () => {
        const styleTag = document.createElement('style');
        if (this.CspNonce) {
          styleTag.setAttribute('nonce', this.CspNonce);
        }
        return styleTag;
      },
      createScriptElement: () => {
        const styleTag = document.createElement('script');
        if (this.CspNonce) {
          styleTag.setAttribute('nonce', this.CspNonce);
        }
        return styleTag;
      },
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
