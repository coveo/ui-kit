import {
  LogLevel,
  getOrganizationEndpoints as getOrganizationEndpointsHeadless,
  PlatformEnvironment,
} from '@coveo/headless';
import {
  CommerceEngine,
  buildCommerceEngine,
  CommerceEngineConfiguration,
} from '@coveo/headless/commerce';
import {
  Component,
  h,
  Prop,
  Listen,
  Method,
  Watch,
  Element,
  State,
} from '@stencil/core';
import i18next, {i18n} from 'i18next';
import {InitializeEvent} from '../../../utils/initialization-utils';
import {CommonBindings} from '../../common/interface/bindings';
import {i18nCompatibilityVersion} from '../../common/interface/i18n';
import {
  BaseAtomicInterface,
  CommonAtomicInterfaceHelper,
} from '../../common/interface/interface-common';
import {getAnalyticsConfig} from './analytics-config';
import {AtomicStore, createAtomicStore} from './store';

const FirstSearchExecutedFlag = 'firstSearchExecuted';
export type InitializationOptions = CommerceEngineConfiguration;
export type CommerceBindings = CommonBindings<
  CommerceEngine,
  AtomicStore,
  HTMLAtomicCommerceInterfaceElement
>;

// TODO: This should be the basis for commerce PLP, Search and recs interfaces
/**
 * The `atomic-commerce-interface` component is the parent to all other atomic components in a search page. It handles the headless search engine and localization configurations.
 */
@Component({
  tag: 'atomic-commerce-interface',
  styleUrl: 'atomic-commerce-interface.pcss',
  shadow: true,
  assetsDirs: ['../../search/atomic-search-interface/lang'],
})
export class AtomicCommerceInterface
  implements BaseAtomicInterface<CommerceEngine>
{
  private store = createAtomicStore();
  private commonInterfaceHelper: CommonAtomicInterfaceHelper<CommerceEngine>;

  @Element() public host!: HTMLAtomicCommerceInterfaceElement;

  @State() public error?: Error;

  /**
   * Whether analytics should be enabled.
   */
  @Prop({reflect: true}) public analytics = true;

  /**
   * The severity level of the messages to log in the console.
   */
  @Prop({reflect: true}) public logLevel?: LogLevel;

  /**
   * The compatibility JSON version for i18next to use (see [i18next Migration Guide](https://www.i18next.com/misc/migration-guide#v20.x.x-to-v21.0.0)).
   */
  @Prop() public localizationCompatibilityVersion: i18nCompatibilityVersion =
    'v3';

  /**
   * The search interface i18next instance.
   */
  @Prop() public i18n: i18n = i18next.createInstance();

  /**
   * The search interface language.
   */
  @Prop({reflect: true}) public language = 'en';

  /**
   * The search interface headless engine.
   */
  @Prop({mutable: true}) public engine?: CommerceEngine;

  /**
   * The CSS selector for the container where the interface will scroll back to.
   */
  @Prop({reflect: true}) public scrollContainer = 'atomic-commerce-interface';

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
   * Whether the relevance inspector shortcut should be enabled for this interface.
   *
   * The relevance inspector can be opened by holding the Alt key (Option on Mac) while over the interface, and performing a double click.
   *
   * The relevance inspector allows to troubleshoot and debug queries.
   */
  @Prop({reflect: true}) public enableRelevanceInspector = true;

  /**
   * A reference clone of the search interface i18next instance.
   */
  private i18nClone!: i18n;

  public constructor() {
    this.commonInterfaceHelper = new CommonAtomicInterfaceHelper(
      this,
      'CoveoAtomic'
    );
  }

  public connectedCallback() {
    this.store.setLoadingFlag(FirstSearchExecutedFlag);
    this.updateMobileBreakpoint();
    this.i18nClone = this.i18n.cloneInstance();
    this.i18n.addResourceBundle = (
      lng: string,
      ns: string,
      resources: object,
      deep?: boolean,
      overwrite?: boolean
    ) => this.addResourceBundleWithWarning(lng, ns, resources, deep, overwrite);
  }

  componentWillLoad() {
    this.initAriaLive();
  }

  @Watch('analytics')
  public toggleAnalytics() {
    if (!this.commonInterfaceHelper.engineIsCreated(this.engine)) {
      return;
    }

    this.commonInterfaceHelper.onAnalyticsChange();
  }

  @Watch('iconAssetsPath')
  public updateIconAssetsPath() {
    this.store.set('iconAssetsPath', this.iconAssetsPath);
  }

  @Listen('atomic/initializeComponent')
  public handleInitialization(event: InitializeEvent) {
    this.commonInterfaceHelper.onComponentInitializing(event);
  }

  @Listen('atomic/scrollToTop')
  public scrollToTop() {
    const scrollContainerElement = document.querySelector(this.scrollContainer);
    if (!scrollContainerElement) {
      this.bindings.engine.logger.warn(
        `Could not find the scroll container with the selector "${this.scrollContainer}". This will prevent UX interactions that require a scroll from working correctly. Please check the CSS selector in the scrollContainer option`
      );
      return;
    }

    scrollContainerElement.scrollIntoView({behavior: 'smooth'});
  }

  /**
   * Initializes the connection with the headless search engine using options for accessToken (required), organizationId (required), renewAccessToken, organizationEndpoints (recommended), and platformUrl (deprecated).
   */
  @Method()
  public initialize(options: InitializationOptions) {
    return this.internalInitialization(() => this.initEngine(options));
  }

  /**
   * Initializes the connection with an already preconfigured [headless search engine](https://docs.coveo.com/en/headless/latest/reference/search/), as opposed to the `initialize` method, which will internally create a new search engine instance.
   * This bypasses the properties set on the component, such as analytics, searchHub, pipeline, language, timezone & logLevel.
   */
  @Method()
  public initializeWithCommerceEngine(engine: CommerceEngine) {
    return this.internalInitialization(() => (this.engine = engine));
  }

  /**
   * Returns the unique, organization-specific endpoint(s).
   * @param {string} organizationId
   * @param {"prod"|"hipaa"|"staging"|"dev"} [env=Prod]
   */
  @Method()
  public async getOrganizationEndpoints(
    organizationId: string,
    env: PlatformEnvironment = 'prod'
  ) {
    return getOrganizationEndpointsHeadless(organizationId, env);
  }

  public get bindings(): CommerceBindings {
    return {
      engine: this.engine!,
      i18n: this.i18n,
      store: this.store,
      interfaceElement: this.host,
    };
  }

  private updateMobileBreakpoint() {
    const breakpoint = this.host.querySelector(
      'atomic-search-layout'
    )?.mobileBreakpoint;
    if (breakpoint) {
      this.store.set('mobileBreakpoint', breakpoint);
    }
  }

  private initEngine(options: InitializationOptions) {
    const analyticsConfig = getAnalyticsConfig(
      options,
      this.analytics,
      this.store
    );
    try {
      this.engine = buildCommerceEngine({
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

  private initAriaLive() {
    if (
      Array.from(this.host.children).some(
        (element) => element.tagName === 'ATOMIC-ARIA-LIVE'
      )
    ) {
      return;
    }
    this.host.prepend(document.createElement('atomic-aria-live'));
  }

  private async internalInitialization(initEngine: () => void) {
    await this.commonInterfaceHelper.onInitialization(initEngine);
  }

  private addResourceBundleWithWarning(
    lng: string,
    ns: string,
    resources: object,
    deep?: boolean,
    overwrite?: boolean
  ) {
    const hasV3Keys = Object.keys(resources).some((k) => k.includes('_plural'));
    if (hasV3Keys && ns === 'translation') {
      this.engine &&
        this.engine.logger.warn(
          `Translation keys using the v3 JSON compatibility format have been detected. As of Atomic version 3.0.0, support for JSON compatibility ${this.localizationCompatibilityVersion} will be deprecated. Please update your translation JSON keys to v4 format: { my-key_other: 'My translations!' } For more information, see i18next Migration Guide: https://www.i18next.com/misc/migration-guide#v20.x.x-to-v21.0.0.`
        );
    }
    return this.i18nClone.addResourceBundle(
      lng,
      ns,
      resources,
      deep,
      overwrite
    );
  }

  public render() {
    return ['Hi from commerce interface!', <slot></slot>];
  }

  registerFieldsToInclude(): void {}
}
