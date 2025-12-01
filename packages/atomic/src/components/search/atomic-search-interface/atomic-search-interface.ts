import {
  buildSearchEngine,
  buildSearchStatus,
  buildUrlManager,
  EcommerceDefaultFieldsToInclude,
  VERSION as HEADLESS_VERSION,
  type LogLevel,
  loadConfigurationActions,
  loadFieldActions,
  loadQueryActions,
  loadSearchConfigurationActions,
  type SearchEngine,
  type SearchEngineConfiguration,
  type SearchStatus,
  type Unsubscribe,
  type UrlManager,
} from '@coveo/headless';
import {provide} from '@lit/context';
import i18next, {type i18n} from 'i18next';
import {type CSSResultGroup, css, html, LitElement} from 'lit';
import {customElement, property, query, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {bindingsContext} from '@/src/components/common/context/bindings-context';
import type {
  CommonBindings,
  NonceBindings,
} from '@/src/components/common/interface/bindings';
import {
  type BaseAtomicInterface,
  InterfaceController,
} from '@/src/components/common/interface/interface-controller';
import {MobileBreakpointController} from '@/src/components/common/layout/mobile-breakpoint-controller';
import {
  errorSelector,
  firstSearchExecutedSelector,
  noResultsSelector,
} from '@/src/components/search/atomic-search-layout/search-layout';
import {booleanConverter} from '@/src/converters/boolean-converter';
import {errorGuard} from '@/src/decorators/error-guard';
import {watch} from '@/src/decorators/watch';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {ChildrenUpdateCompleteMixin} from '@/src/mixins/children-update-complete-mixin';
import {waitForAtomicChildrenToBeDefined} from '@/src/utils/custom-element-tags';
import {type InitializeEvent, markParentAsReady} from '@/src/utils/init-queue';
import {
  SafeStorage,
  type StandaloneSearchBoxData,
  StorageItems,
} from '@/src/utils/local-storage-utils';
import '@/src/components/search/atomic-relevance-inspector/atomic-relevance-inspector';
import type {AtomicRelevanceInspector} from '@/src/components/search/atomic-relevance-inspector/atomic-relevance-inspector';
import {getAnalyticsConfig} from './analytics-config';
import {createSearchStore, type SearchStore} from './store';
// TODO - Remove once all components that use atomic-modal have been migrated.
import '@/src/components/common/atomic-modal/atomic-modal';
// TODO - KIT-4989: Remove once atomic-result-icon is migrated
import '@/src/components/common/atomic-icon/atomic-icon';
// TODO - KIT-5056: Remove once atomic-result-list has been migrated.
import '@/src/components/search/atomic-result/atomic-result';
import {augmentAnalyticsConfigWithAtomicVersion} from '@/src/components/common/interface/analytics-config';
import {arrayConverter} from '@/src/converters/array-converter';

export type InitializationOptions = SearchEngineConfiguration;

export type Bindings = CommonBindings<
  SearchEngine,
  SearchStore,
  AtomicSearchInterface
> &
  //TODO: KIT-4893 - Remove once atomic-quickview-modal migration is complete.
  NonceBindings;

const FirstSearchExecutedFlag = 'firstSearchExecuted';

/**
 * The `atomic-search-interface` component is the parent to all other atomic components in a search page. It handles the headless search engine and localization configurations.
 *
 * @slot default - The default slot where you can add child components to the interface.
 */
@customElement('atomic-search-interface')
@withTailwindStyles
export class AtomicSearchInterface
  extends ChildrenUpdateCompleteMixin(LitElement)
  implements BaseAtomicInterface<SearchEngine>
{
  @state()
  @provide({context: bindingsContext})
  public bindings: Bindings = {} as Bindings;
  @state() public error!: Error;

  public urlManager!: UrlManager;
  public searchStatus!: SearchStatus;
  private unsubscribeUrlManager: Unsubscribe = () => {};
  private unsubscribeSearchStatus: Unsubscribe = () => {};
  private initialized = false;
  private store: SearchStore;
  private i18Initialized: Promise<void>;
  private interfaceController = new InterfaceController<SearchEngine>(
    this,
    'CoveoAtomic',
    HEADLESS_VERSION
  );

  @query('atomic-relevance-inspector')
  private relevanceInspector?: AtomicRelevanceInspector;

  static styles: CSSResultGroup = [
    css`
      :host {
        height: inherit;
        width: inherit;
        & > slot {
          height: inherit;
        }
      }
    `,
  ];

  /**
   * A list of non-default fields to include in the query results.
   *
   * Specify the property as an array using a JSON string representation:
   * ```html
   * <atomic-search-interface fields-to-include='["fieldA", "fieldB"]'></atomic-search-interface>
   * ```
   */
  @property({
    type: Array,
    attribute: 'fields-to-include',
    converter: arrayConverter,
  })
  public fieldsToInclude: string[] = [];

  /**
   * The search interface [query pipeline](https://docs.coveo.com/en/180/).
   *
   * If the search interface is initialized using [`initializeWithSearchEngine`](https://docs.coveo.com/en/atomic/latest/reference/components/atomic-search-interface/#initializewithsearchengine), the query pipeline should instead be configured in the target engine.
   */
  @property({type: String, reflect: true}) public pipeline?: string;

  /**
   * The search interface [search hub](https://docs.coveo.com/en/1342/).
   *
   * If the search interface is initialized using [`initializeWithSearchEngine`](https://docs.coveo.com/en/atomic/latest/reference/components/atomic-search-interface/#initializewithsearchengine, the search hub should instead be configured in the target engine.
   */
  @property({type: String, attribute: 'search-hub', reflect: true})
  public searchHub?: string;

  // TODO - KIT-4994: Add disableAnalytics property that defaults to false.

  // TODO - KIT-4994: Deprecate in favor of disableAnalytics property.
  // TODO - (v4) KIT-4990: Remove.
  /**
   * Whether analytics should be enabled.
   */
  @property({
    type: Boolean,
    converter: booleanConverter,
    reflect: true,
  })
  public analytics = true;

  /**
   * The [tz database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) identifier of the time zone to use to correctly interpret dates in the query expression, facets, and result items.
   * By default, the timezone will be [guessed](https://day.js.org/docs/en/timezone/guessing-user-timezone).
   *
   * Example: "America/Montreal"
   */
  @property({type: String, reflect: true}) public timezone?: string;

  /**
   * The minimum severity level of messages to log in the console.
   * Messages with a severity level below this threshold will not be logged.
   * Possible values are `trace`, `debug`, `info`, `warn`, `error`, `fatal`, or `silent`.
   */
  @property({type: String, attribute: 'log-level', reflect: true})
  public logLevel?: LogLevel;

  /**
   * The search interface i18next instance.
   */
  @property({type: Object, attribute: false}) public i18n: i18n;

  /**
   * The search interface language.
   */
  @property({type: String, reflect: true}) public language = 'en';

  /**
   * The search interface headless engine.
   */
  @property({type: Object, attribute: false}) public engine?: SearchEngine;

  // TODO - (v4) KIT-4823: Remove.
  /**
   * Whether the state should be reflected in the URL parameters.
   * @deprecated - replaced by `disable-state-reflection-in-url` (this defaults to `true`, while the replacement defaults to `false`).
   */
  @property({
    type: Boolean,
    attribute: 'reflect-state-in-url',
    reflect: true,
    converter: booleanConverter,
  })
  reflectStateInUrl = true;

  /**
   * Whether to disable state reflection in the URL parameters.
   */
  @property({
    type: Boolean,
    attribute: 'disable-state-reflection-in-url',
    reflect: true,
  })
  disableStateReflectionInUrl = false;

  /**
   * The CSS selector for the container where the interface will scroll back to.
   */
  @property({type: String, attribute: 'scroll-container', reflect: true})
  public scrollContainer = 'atomic-search-interface';

  /**
   * The language assets path. By default, this will be a relative URL pointing to `./lang`.
   *
   * Example: "/mypublicpath/languages"
   *
   */
  @property({type: String, attribute: 'language-assets-path', reflect: true})
  public languageAssetsPath = './lang';

  /**
   * The icon assets path. By default, this will be a relative URL pointing to `./assets`.
   *
   * Example: "/mypublicpath/icons"
   *
   */
  @property({type: String, attribute: 'icon-assets-path', reflect: true})
  public iconAssetsPath = './assets';

  // TODO - (v4) KIT-5004: Remove.
  /**
   * Whether the relevance inspector shortcut should be enabled for this interface.
   *
   * The relevance inspector can be opened by holding the Alt key (Option on Mac) while over the interface, and performing a double-click.
   *
   * The relevance inspector allows to troubleshoot and debug queries.
   * @deprecated - replaced by `disable-relevance-inspector` (this defaults to `true`, while the replacement defaults to `false`).
   */
  @property({
    type: Boolean,
    attribute: 'enable-relevance-inspector',
    reflect: true,
    converter: booleanConverter,
  })
  public enableRelevanceInspector = true;

  /**
   * Whether to disable the relevance inspector shortcut for this interface.
   */
  @property({
    type: Boolean,
    attribute: 'disable-relevance-inspector',
    reflect: true,
  })
  public disableRelevanceInspector = false;

  public constructor() {
    super();
    this.store = createSearchStore();
    new MobileBreakpointController(this, this.store);
    const {promise, resolve} = Promise.withResolvers<void>();
    this.i18Initialized = promise;
    this.i18n = i18next.createInstance(undefined, resolve);
  }

  public connectedCallback() {
    super.connectedCallback();
    this.store.setLoadingFlag(FirstSearchExecutedFlag);
    this.initFieldsToInclude();

    this.addEventListener(
      'atomic/initializeComponent',
      this.handleInitialization as EventListener
    );

    this.addEventListener(
      'atomic/scrollToTop',
      this.scrollToTop as EventListener
    );
  }

  public willUpdate(changedProperties: Map<string, unknown>) {
    super.willUpdate(changedProperties);

    if (changedProperties.has('fieldsToInclude')) {
      this.updateFieldsToInclude();
    }
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    if (typeof this.unsubscribeUrlManager === 'function') {
      this.unsubscribeUrlManager();
    }
    if (typeof this.unsubscribeSearchStatus === 'function') {
      this.unsubscribeSearchStatus();
    }
    window.removeEventListener('hashchange', this.onHashChange);
    this.removeEventListener(
      'atomic/initializeComponent',
      this.handleInitialization as EventListener
    );
    this.removeEventListener(
      'atomic/scrollToTop',
      this.scrollToTop as EventListener
    );
  }

  // TODO - (v4) KIT-4991: Make private.
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
   * @deprecated provided for backward compatibility. set the 'open' property directly on the relevance inspector instead.
   */
  public closeRelevanceInspector() {
    if (this.relevanceInspector) {
      this.relevanceInspector.open = false;
    }
  }

  /**
   * Initializes the connection with the headless search engine using options for `accessToken` (required), `organizationId` (required), `environment` (defaults to `prod`), and `renewAccessToken`.
   */
  public initialize(options: InitializationOptions) {
    return this.internalInitialization(() => this.initEngine(options));
  }

  /**
   * Initializes the interface using the provided [headless search engine](https://docs.coveo.com/en/headless/latest/reference/modules/Search.html, as opposed to the `initialize` method which internally builds a search engine instance.
   * This bypasses the properties set on the component, such as analytics, searchHub, pipeline, language, timezone, and logLevel.
   */
  public initializeWithSearchEngine(engine: SearchEngine) {
    if (this.pipeline && this.pipeline !== engine.state.pipeline) {
      console.warn(
        'Mismatch between search interface pipeline and engine pipeline. The engine pipeline will be used.'
      );
    }
    if (this.searchHub && this.searchHub !== engine.state.searchHub) {
      console.warn(
        'Mismatch between search interface search hub and engine search hub. The engine search hub will be used.'
      );
    }

    engine.dispatch(
      loadConfigurationActions(engine).updateAnalyticsConfiguration({
        ...augmentAnalyticsConfigWithAtomicVersion(),
      })
    );
    return this.internalInitialization(() => {
      this.engine = engine;
    });
  }

  /**
   *
   * Executes the first search and logs the interface load event to analytics, after initializing connection to the headless search engine.
   */
  public async executeFirstSearch() {
    if (!this.interfaceController.engineIsCreated(this.engine)) {
      return;
    }

    if (!this.initialized) {
      console.error(
        'You have to wait until the "initialize" promise is fulfilled before executing a search.',
        this
      );
      return;
    }

    const safeStorage = new SafeStorage();
    const standaloneSearchBoxData =
      safeStorage.getParsedJSON<StandaloneSearchBoxData | null>(
        StorageItems.STANDALONE_SEARCH_BOX_DATA,
        null
      );

    if (!standaloneSearchBoxData) {
      this.engine.executeFirstSearch();
      return;
    }

    safeStorage.removeItem(StorageItems.STANDALONE_SEARCH_BOX_DATA);
    const {updateQuery} = loadQueryActions(this.engine!);
    const {value, enableQuerySyntax, analytics} = standaloneSearchBoxData;
    this.engine!.dispatch(updateQuery({q: value, enableQuerySyntax}));
    this.engine.executeFirstSearchAfterStandaloneSearchBoxRedirect(analytics);
  }

  public updateSearchConfiguration(
    updatedProp: 'searchHub' | 'pipeline',
    newValue: string | undefined
  ) {
    if (!this.interfaceController.engineIsCreated(this.engine)) {
      return;
    }

    if (this.engine.state[updatedProp] === newValue) {
      return;
    }

    const {updateSearchConfiguration} = loadSearchConfigurationActions(
      this.engine
    );
    this.engine.dispatch(
      updateSearchConfiguration({
        [updatedProp]: newValue,
      })
    );
  }

  public registerFieldsToInclude() {
    this.engine?.dispatch(
      loadFieldActions(this.engine!).registerFieldsToInclude(
        this.store.state.fieldsToInclude
      )
    );
  }

  @watch('searchHub')
  public updateSearchHub() {
    this.updateSearchConfiguration('searchHub', this.searchHub ?? 'default');
  }

  @watch('pipeline')
  public updatePipeline() {
    this.updateSearchConfiguration('pipeline', this.pipeline);
  }

  @watch('analytics')
  public toggleAnalytics() {
    if (!this.interfaceController.engineIsCreated(this.engine)) {
      return;
    }
    this.interfaceController.onAnalyticsChange();
  }

  @watch('language')
  public updateLanguage() {
    if (
      !this.interfaceController.engineIsCreated(this.engine) ||
      !this.language
    ) {
      return;
    }

    const {updateSearchConfiguration} = loadSearchConfigurationActions(
      this.engine
    );
    this.engine.dispatch(
      updateSearchConfiguration({
        locale: this.language,
      })
    );
    return this.interfaceController.onLanguageChange();
  }

  @watch('iconAssetsPath')
  public updateIconAssetsPath(): void {
    this.store.state.iconAssetsPath = this.iconAssetsPath;
  }

  @errorGuard()
  render() {
    return html`
      ${when(
        this.bindings?.engine &&
          this.enableRelevanceInspector &&
          !this.disableRelevanceInspector,
        () => html`<atomic-relevance-inspector></atomic-relevance-inspector>`
      )}
      <slot></slot>
    `;
  }

  private handleInitialization = (event: InitializeEvent) => {
    this.interfaceController.onComponentInitializing(event);
  };

  private getBindings(): Bindings {
    return {
      engine: this.engine!,
      i18n: this.i18n,
      store: this.store,
      interfaceElement: this,
      createStyleElement: () => {
        const styleTag = document.createElement('style');
        return styleTag;
      },
      // TODO - KIT-4893: Remove once atomic-quickview-modal migration is complete.
      createScriptElement: () => {
        const scriptTag = document.createElement('script');
        return scriptTag;
      },
    };
  }

  private initFieldsToInclude() {
    const fields = EcommerceDefaultFieldsToInclude.concat(this.fieldsToInclude);
    this.store.addFieldsToInclude(fields);
  }

  private updateFieldsToInclude() {
    this.store.state.fieldsToInclude = [];
    this.initFieldsToInclude();
    this.registerFieldsToInclude();
  }

  private initEngine(options: InitializationOptions) {
    const searchConfig = this.getSearchConfiguration(options);
    const analyticsConfig = getAnalyticsConfig(
      options,
      this.analytics,
      this.store
    );
    try {
      this.engine = buildSearchEngine({
        configuration: {
          ...options,
          search: searchConfig,
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

  private getSearchConfiguration(options: InitializationOptions) {
    const searchConfigFromProps = {
      searchHub: this.searchHub ?? 'default',
      pipeline: this.pipeline,
      locale: this.language,
      timezone: this.timezone,
    };

    if (options.search) {
      return {
        ...searchConfigFromProps,
        ...options.search,
      };
    }

    return searchConfigFromProps;
  }

  private get fragment() {
    return window.location.hash.slice(1);
  }

  private initUrlManager() {
    if (this.disableStateReflectionInUrl) {
      return;
    }
    if (!this.reflectStateInUrl) {
      return;
    }

    this.urlManager = buildUrlManager(this.engine!, {
      initialState: {fragment: this.fragment},
    });

    this.unsubscribeUrlManager = this.urlManager.subscribe(() =>
      this.updateHash()
    );

    window.addEventListener('hashchange', this.onHashChange);
  }

  private async internalInitialization(initEngine: () => void) {
    await Promise.all([
      this.interfaceController.onInitialization(initEngine),
      this.i18Initialized,
    ]);
    this.updateLanguage();
    this.bindings = this.getBindings();
    markParentAsReady(this);
    this.pipeline = this.engine!.state.pipeline;
    this.searchHub = this.engine!.state.searchHub;
    this.initSearchStatus();
    await waitForAtomicChildrenToBeDefined(this);
    await this.getUpdateComplete();
    this.initUrlManager();
    this.initialized = true;
  }

  private initSearchStatus() {
    this.searchStatus = buildSearchStatus(this.engine!);
    this.unsubscribeSearchStatus = this.searchStatus.subscribe(() => {
      const hasNoResultsAfterInitialSearch =
        !this.searchStatus.state.hasResults &&
        this.searchStatus.state.firstSearchExecuted &&
        !this.searchStatus.state.hasError;

      this.classList.toggle(noResultsSelector, hasNoResultsAfterInitialSearch);

      this.classList.toggle(errorSelector, this.searchStatus.state.hasError);

      this.classList.toggle(
        firstSearchExecutedSelector,
        this.searchStatus.state.firstSearchExecuted
      );

      if (
        this.searchStatus.state.firstSearchExecuted &&
        this.store.hasLoadingFlag(FirstSearchExecutedFlag)
      ) {
        this.store.unsetLoadingFlag(FirstSearchExecutedFlag);
      }
    });
  }

  private updateHash() {
    const newFragment = this.urlManager.state.fragment;

    if (!this.searchStatus.state.firstSearchExecuted) {
      history.replaceState(null, document.title, `#${newFragment}`);
      this.bindings.engine.logger.info(`History replaceState #${newFragment}`);

      return;
    }

    history.pushState(null, document.title, `#${newFragment}`);
    this.bindings.engine.logger.info(`History pushState #${newFragment}`);
  }

  private onHashChange = () => {
    this.urlManager.synchronize(this.fragment);
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-search-interface': AtomicSearchInterface;
  }
}
