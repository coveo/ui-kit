import {
  CommerceEngine,
  CommerceEngineConfiguration,
  Context,
  buildContext,
} from '@coveo/headless/commerce';
import {
  Component,
  Prop,
  h,
  Listen,
  Method,
  Watch,
  Element,
  State,
  setNonce,
} from '@stencil/core';
import i18next, {i18n} from 'i18next';
import {InitializeEvent} from '../../../utils/initialization-utils';
import {CommonBindings, NonceBindings} from '../../common/interface/bindings';
import {
  StencilBaseAtomicInterface,
  CommonAtomicInterfaceHelper,
} from '../../common/interface/interface-common-stencil';
import {AtomicCommerceInterface} from '../lazy-index';
import {
  CommerceRecommendationStore,
  createCommerceRecommendationStore,
} from './store';

export type CommerceInitializationOptions = CommerceEngineConfiguration;
export type CommerceBindings = CommonBindings<
  CommerceEngine,
  CommerceRecommendationStore,
  AtomicCommerceInterface
> &
  NonceBindings;

/**
 * @alpha
 * The `atomic-commerce-recommendation-interface` component is meant to be used as the parent of one or more `atomic-commerce-recommendation-list` components. It handles the headless search engine and localization configurations.
 */
@Component({
  tag: 'atomic-commerce-recommendation-interface',
  styleUrl: 'atomic-commerce-recommendation-interface.pcss',
  shadow: true,
  assetsDirs: ['lang'],
})
export class AtomicCommerceRecommendationInterface
  implements StencilBaseAtomicInterface<CommerceEngine>
{
  private store = createCommerceRecommendationStore();
  private commonInterfaceHelper: CommonAtomicInterfaceHelper<CommerceEngine>;

  @Element() public host!: AtomicCommerceInterface;

  @State() public error?: Error;

  /**
   * The commerce interface i18next instance.
   */
  @Prop() public i18n: i18n = i18next.createInstance();

  /**
   * The commerce interface headless engine.
   */
  @Prop({mutable: true}) public engine!: CommerceEngine;

  /**
   * The CSS selector for the container the interface will scroll back to.
   */
  @Prop({reflect: true}) public scrollContainer =
    'atomic-commerce-recommendation-interface';

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
   * The value to set the [nonce](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/nonce) attribute to on inline script and style elements generated by this interface and its child components.
   * If your application is served with a Content Security Policy (CSP) that doesn't include the `script-src: 'unsafe-inline'` or `style-src: 'unsafe-inline'` directives,
   * you should ensure that your application server generates a new nonce on every page load and uses the generated value to set this prop and serve the corresponding CSP response headers
   * (i.e., script-src 'nonce-<YOUR_GENERATED_NONCE>' and style-src 'nonce-<YOUR_GENERATED_NONCE>').
   * Otherwise you may see console errors such as
   *  - Refused to execute inline script because it violates the following Content Security Policy directive: [...]
   *  - Refused to apply inline style because it violates the following Content Security Policy directive: [...].
   * @example:
   * ```html
   * <script nonce="<YOUR_GENERATED_NONCE>">
   *  import {setNonce} from '@coveo/atomic';
   *  setNonce('<YOUR_GENERATED_NONCE>');
   * </script>
   * ```
   */
  @Prop({reflect: true}) public CspNonce?: string;

  /**
   * The commerce interface language.
   *
   * Will default to the value set in the Headless engine context if not provided.
   */
  @Prop({reflect: true, mutable: true}) public language?: string;

  /**
   * Whether to enable analytics.
   */
  @Prop({reflect: true}) public analytics = true;

  private i18nClone!: i18n;

  private contextController!: Context;

  public constructor() {
    this.commonInterfaceHelper = new CommonAtomicInterfaceHelper(
      this,
      'CoveoAtomic'
    );
  }

  public connectedCallback() {
    this.i18nClone = this.i18n.cloneInstance();
    this.i18n.addResourceBundle = (
      lng: string,
      ns: string,
      resources: object,
      deep?: boolean,
      overwrite?: boolean
    ) => this.addResourceBundle(lng, ns, resources, deep, overwrite);
  }

  componentWillLoad() {
    if (this.CspNonce) {
      setNonce(this.CspNonce);
    }
    this.initAriaLive();
  }

  @Watch('analytics')
  public toggleAnalytics() {
    this.commonInterfaceHelper.onAnalyticsChange();
  }

  @Watch('language')
  public updateLanguage() {
    if (!this.commonInterfaceHelper.engineIsCreated(this.engine)) {
      return;
    }

    if (!this.language) {
      return;
    }

    this.contextController.setLanguage(this.language);

    this.commonInterfaceHelper.onLanguageChange();
  }

  @Watch('iconAssetsPath')
  public updateIconAssetsPath() {
    this.store.state.iconAssetsPath = this.iconAssetsPath;
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
   * Initializes the connection with an already preconfigured [headless commerce engine](https://docs.coveo.com/en/headless/latest/reference/commerce/).
   */
  @Method() public initializeWithEngine(engine: CommerceEngine) {
    return this.internalInitialization(() => (this.engine = engine));
  }

  public get bindings(): CommerceBindings {
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

  private initContext() {
    this.contextController = buildContext(this.bindings.engine);
  }

  private initLanguage() {
    if (!this.language) {
      this.language = this.contextController.state.language;
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
    this.initContext();
    this.initLanguage();
  }

  private addResourceBundle(
    lng: string,
    ns: string,
    resources: object,
    deep?: boolean,
    overwrite?: boolean
  ) {
    return this.i18nClone.addResourceBundle(
      lng,
      ns,
      resources,
      deep,
      overwrite
    );
  }

  public render() {
    return [<slot></slot>];
  }
}
