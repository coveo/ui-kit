import {VERSION as HEADLESS_VERSION} from '@coveo/headless';
import {
  buildInsightEngine,
  buildResultsPerPage as buildInsightResultsPerPage,
  type InsightEngine,
  type InsightEngineConfiguration,
  type LogLevel as InsightLogLevel,
  loadFieldActions,
} from '@coveo/headless/insight';
import {provide} from '@lit/context';
import i18next, {type i18n} from 'i18next';
import {type CSSResultGroup, css, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {booleanConverter} from '@/src/converters/boolean-converter';
import {errorGuard} from '@/src/decorators/error-guard';
import {watch} from '@/src/decorators/watch';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {type InitializeEvent, markParentAsReady} from '@/src/utils/init-queue';
import {ChildrenUpdateCompleteMixin} from '../../../mixins/children-update-complete-mixin';
import type {
  CommonBindings,
  NonceBindings,
} from '../../common/interface/bindings';
import {
  type BaseAtomicInterface,
  InterfaceController,
} from '../../common/interface/interface-controller';
import {bindingsContext} from '../../context/bindings-context';
import {getAnalyticsConfig} from './analytics-config';
import {createInsightStore, type InsightStore} from './store';

const FirstInsightRequestExecutedFlag = 'firstInsightRequestExecuted';
export type InsightInitializationOptions = InsightEngineConfiguration;
export type InsightBindings = CommonBindings<
  InsightEngine,
  InsightStore,
  AtomicInsightInterface
> &
  NonceBindings;

/**
 * The `atomic-insight-interface` component is the parent to all other atomic insight components in an insight page.
 * It handles the headless insight engine and localization configurations.
 *
 * @slot default - The default slot where you can add child components to the interface.
 * @slot full-search - A slot for components that should be positioned absolutely in the top-right corner.
 * @internal
 */
@customElement('atomic-insight-interface')
@withTailwindStyles
export class AtomicInsightInterface
  extends ChildrenUpdateCompleteMixin(LitElement)
  implements BaseAtomicInterface<InsightEngine>
{
  private initialized = false;
  public store: InsightStore;
  private interfaceController = new InterfaceController<InsightEngine>(
    this,
    'CoveoAtomic',
    HEADLESS_VERSION
  );

  @state() public error!: Error;

  static styles: CSSResultGroup = css`
    :host {
      position: relative;
      display: block;
    }

    slot[name='full-search'] {
      position: absolute;
      top: 0;
      right: 0;
      display: block;
    }
  `;

  /**
   * The service insight interface headless engine.
   */
  @property({type: Object}) public engine?: InsightEngine;

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
   * The service insight interface i18next instance.
   */
  @property({type: Object}) public i18n: i18n;

  /**
   * The severity level of the messages to log in the console.
   */
  @property({type: String, attribute: 'log-level', reflect: true})
  public logLevel?: InsightLogLevel;

  /**
   * The service insight interface language.
   */
  @property({type: String, attribute: 'language', reflect: true})
  public language = 'en';

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

  /**
   * A list of non-default fields to include in the query results.
   *
   * Specify the property as an array using a JSON string representation:
   * ```html
   * <atomic-insight-interface fields-to-include='["fieldA", "fieldB"]'></atomic-insight-interface>
   * ```
   */
  @property({type: Array, attribute: 'fields-to-include'})
  public fieldsToInclude: string[] | string = [];

  /**
   * The number of results per page. By default, this is set to `5`.
   */
  @property({type: Number, attribute: 'results-per-page', reflect: true})
  resultsPerPage = 5;

  private i18Initialized: Promise<void>;

  public constructor() {
    super();
    this.store = createInsightStore();
    const {promise, resolve} = Promise.withResolvers<void>();
    this.i18Initialized = promise;
    this.i18n = i18next.createInstance(undefined, resolve);
  }

  public connectedCallback() {
    super.connectedCallback();
    this.store.setLoadingFlag(FirstInsightRequestExecutedFlag);

    this.addEventListener(
      'atomic/initializeComponent',
      this.handleInitialization as EventListener
    );
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener(
      'atomic/initializeComponent',
      this.handleInitialization as EventListener
    );
  }

  @watch('analytics')
  public toggleAnalytics() {
    this.interfaceController.onAnalyticsChange();
  }

  @watch('language')
  public updateLanguage() {
    return this.interfaceController.onLanguageChange();
  }

  @watch('iconAssetsPath')
  public updateIconAssetsPath(): void {
    this.store.state.iconAssetsPath = this.iconAssetsPath;
  }

  private handleInitialization = (event: InitializeEvent) => {
    this.interfaceController.onComponentInitializing(event);
  };

  private initResultsPerPage() {
    if (!this.interfaceController.engineIsCreated(this.engine)) {
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
  public initialize(options: InsightInitializationOptions) {
    return this.internalInitialization(() => this.initEngine(options));
  }

  /**
   * Initializes the connection with an already preconfigured headless insight engine.
   */
  public initializeWithInsightEngine(engine: InsightEngine) {
    return this.internalInitialization(() => {
      this.engine = engine;
    });
  }

  /**
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
    this.engine.executeFirstSearch();
  }

  @state()
  @provide({context: bindingsContext})
  public bindings: InsightBindings = {} as InsightBindings;

  private async internalInitialization(initEngine: () => void) {
    await Promise.all([
      this.interfaceController.onInitialization(initEngine),
      this.i18Initialized,
    ]);
    this.updateLanguage();
    this.bindings = this.getBindings();
    markParentAsReady(this);
    this.initResultsPerPage();
    this.registerFieldsToInclude();
    this.store.unsetLoadingFlag(FirstInsightRequestExecutedFlag);
    this.initialized = true;
  }

  private getBindings(): InsightBindings {
    return {
      engine: this.engine!,
      i18n: this.i18n,
      store: this.store,
      interfaceElement: this as AtomicInsightInterface,
      createStyleElement: () => {
        const styleTag = document.createElement('style');
        return styleTag;
      },
      createScriptElement: () => {
        const scriptTag = document.createElement('script');
        return scriptTag;
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

  @errorGuard()
  render() {
    if (!this.engine) {
      return html``;
    }

    return html`
      <slot name="full-search"></slot>
      <slot></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-insight-interface': AtomicInsightInterface;
  }
}
