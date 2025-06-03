import {watch} from '@/src/decorators/watch';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {ChildrenUpdateCompleteMixin} from '@/src/mixins/children-update-complete-mixin.js';
import {InitializeEvent, markParentAsReady} from '@/src/utils/init-queue';
import {
  buildContext,
  CommerceEngine,
  CommerceEngineConfiguration,
  Context,
} from '@coveo/headless/commerce';
import {provide} from '@lit/context';
import i18next, {i18n} from 'i18next';
import {CSSResultGroup, html, LitElement, unsafeCSS} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {
  AdoptedStylesBindings,
  CommonBindings,
} from '../../common/interface/bindings.js';
import {
  BaseAtomicInterface,
  CommonAtomicInterfaceHelper,
} from '../../common/interface/interface-common.js';
import {bindingsContext} from '../../context/bindings-context.js';
import styles from './atomic-commerce-recommendation-interface.tw.css';
import {
  CommerceRecommendationStore,
  createCommerceRecommendationStore,
} from './store.js';

export type CommerceInitializationOptions = CommerceEngineConfiguration;
export type CommerceBindings = CommonBindings<
  CommerceEngine,
  CommerceRecommendationStore,
  AtomicCommerceRecommendationInterface
> &
  AdoptedStylesBindings;

/**
 * @alpha
 * The `atomic-commerce-recommendation-interface` component is meant to be used as the parent of one or more `atomic-commerce-recommendation-list` components. It handles the headless search engine and localization configurations.
 */
@customElement('atomic-commerce-recommendation-interface')
@withTailwindStyles
export class AtomicCommerceRecommendationInterface
  extends ChildrenUpdateCompleteMixin(LitElement)
  implements BaseAtomicInterface<CommerceEngine>
{
  public context!: Context;
  public store: CommerceRecommendationStore;
  private commonInterfaceHelper: CommonAtomicInterfaceHelper<CommerceEngine>;

  @state() public error?: Error;

  static styles: CSSResultGroup = [unsafeCSS(styles)];

  /**
   * The commerce interface i18next instance.
   */
  @property({type: Object}) i18n: i18n;

  /**
   * The commerce interface headless engine.
   */
  @property({type: Object}) engine?: CommerceEngine;

  /**
   * The CSS selector for the container the interface will scroll back to.
   */
  @property({type: String, attribute: 'scroll-container', reflect: true})
  scrollContainer = 'atomic-commerce-recommendation-interface';

  /**
   * The language assets path. By default, this will be a relative URL pointing to `./lang`.
   *
   * Example: "/mypublicpath/languages"
   *
   */
  @property({type: String, attribute: 'language-assets-path', reflect: true})
  languageAssetsPath = './lang';

  /**
   * The icon assets path. By default, this will be a relative URL pointing to `./assets`.
   *
   * Example: "/mypublicpath/icons"
   *
   */
  @property({type: String, attribute: 'icon-assets-path', reflect: true})
  iconAssetsPath = './assets';

  /**
   * The commerce interface language.
   *
   * Will default to the value set in the Headless engine context if not provided.
   */
  @property({type: String, reflect: true}) language?: string;

  /**
   * Whether to enable analytics.
   */
  @property({
    type: Boolean,
    converter: {
      fromAttribute: (value) => value !== 'false',
    },
    reflect: true,
  })
  analytics = true;

  private i18Initialized: Promise<void>;

  initialized: boolean = false;

  public constructor() {
    super();
    this.commonInterfaceHelper = new CommonAtomicInterfaceHelper(
      this,
      'CoveoAtomic'
    );
    this.store = createCommerceRecommendationStore();
    const {promise, resolve} = Promise.withResolvers<void>();
    this.i18Initialized = promise;
    this.i18n = i18next.createInstance(undefined, resolve);
  }

  public connectedCallback() {
    super.connectedCallback();
    this.addEventListener(
      'atomic/initializeComponent',
      this.handleInitialization as EventListener
    );

    this.addEventListener(
      'atomic/scrollToTop',
      this.scrollToTop as EventListener
    );
  }

  @watch('analytics')
  public toggleAnalytics() {
    this.commonInterfaceHelper.onAnalyticsChange();
  }

  @watch('language')
  public async updateLanguage() {
    if (
      !this.commonInterfaceHelper.engineIsCreated(this.engine) ||
      !this.language ||
      !this.context
    ) {
      return;
    }
    this.context?.setLanguage(this.language);
    return this.commonInterfaceHelper.onLanguageChange();
  }

  @watch('iconAssetsPath')
  public updateIconAssetsPath() {
    this.store.state.iconAssetsPath = this.iconAssetsPath;
  }

  public disconnectedCallback() {
    super.disconnectedCallback();

    this.removeEventListener(
      'atomic/initializeComponent',
      this.handleInitialization as EventListener
    );
    this.removeEventListener(
      'atomic/scrollToTop',
      this.scrollToTop as EventListener
    );
    const ariaLive = this.querySelector('atomic-aria-live');
    if (ariaLive) {
      ariaLive.remove();
    }
  }

  private handleInitialization = (event: InitializeEvent) => {
    this.commonInterfaceHelper.onComponentInitializing(event);
  };

  public scrollToTop() {
    const scrollContainerElement = document.querySelector(this.scrollContainer);
    if (!scrollContainerElement) {
      this.bindings.engine.logger.warn(
        `Could not find the scroll container with the selector "${this.scrollContainer}". This will prevent UX interactions that require a scroll from working correctly. Please review the CSS selector in the scrollContainer option`
      );
      return;
    }

    scrollContainerElement.scrollIntoView({behavior: 'smooth'});
  }

  /**
   * Initializes the connection with an already preconfigured [headless commerce engine](https://docs.coveo.com/en/headless/latest/reference/commerce/).
   */
  public initializeWithEngine(engine: CommerceEngine) {
    return this.internalInitialization(() => (this.engine = engine));
  }

  @state()
  @provide({context: bindingsContext})
  public bindings: CommerceBindings = {} as CommerceBindings;

  public getBindings(): CommerceBindings {
    return {
      engine: this.engine!,
      i18n: this.i18n,
      store: this.store,
      interfaceElement: this as AtomicCommerceRecommendationInterface,
      addAdoptedStyleSheets: (stylesheet) => {
        const parent = this.getRootNode();
        const styleSheet = stylesheet;
        const isDocumentOrShadowRoot =
          parent instanceof Document || parent instanceof ShadowRoot;

        if (
          styleSheet &&
          isDocumentOrShadowRoot &&
          !parent.adoptedStyleSheets.includes(styleSheet)
        ) {
          parent.adoptedStyleSheets.push(styleSheet);
        }
      },
    };
  }

  private initContext() {
    this.context = buildContext(this.engine!);
  }

  private initLanguage() {
    if (!this.language) {
      this.language = this.context.state.language;
    }
  }

  private initAriaLive() {
    if (
      Array.from(this.children).some(
        (element) => element.tagName === 'ATOMIC-ARIA-LIVE'
      )
    ) {
      return;
    }
    const ariaLive = document.createElement('atomic-aria-live');
    this.prepend(ariaLive);
  }

  private async internalInitialization(initEngine: () => void) {
    await Promise.all([
      this.commonInterfaceHelper.onInitialization(initEngine),
      this.i18Initialized,
    ]);
    this.initAriaLive();
    this.initContext();
    this.updateLanguage();
    this.bindings = this.getBindings();
    markParentAsReady(this);
    this.initLanguage();
    this.initialized = true;
  }

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-commerce-recommendation-interface': AtomicCommerceRecommendationInterface;
  }
}
