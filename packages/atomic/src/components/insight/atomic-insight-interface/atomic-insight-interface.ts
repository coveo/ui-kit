import {VERSION as HEADLESS_VERSION} from '@coveo/headless'; // TODO - KIT-4886 import from @coveo/headless/insight
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
import {bindingsContext} from '@/src/components/common/context/bindings-context';
import type {
  CommonBindings,
  NonceBindings,
} from '@/src/components/common/interface/bindings';
import {
  type BaseAtomicInterface,
  InterfaceController,
} from '@/src/components/common/interface/interface-controller';
import {arrayConverter} from '@/src/converters/array-converter.js';
import {booleanConverter} from '@/src/converters/boolean-converter';
import {errorGuard} from '@/src/decorators/error-guard';
import {watch} from '@/src/decorators/watch';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {ChildrenUpdateCompleteMixin} from '@/src/mixins/children-update-complete-mixin';
import {waitForAtomicChildrenToBeDefined} from '@/src/utils/custom-element-tags';
import {type InitializeEvent, markParentAsReady} from '@/src/utils/init-queue';
import {getAnalyticsConfig} from './analytics-config.js';
import {createInsightStore, type InsightStore} from './store.js';

const FirstInsightRequestExecutedFlag = 'firstInsightRequestExecuted';
export type InsightInitializationOptions = InsightEngineConfiguration;
export type InsightBindings = CommonBindings<
  InsightEngine,
  InsightStore,
  AtomicInsightInterface
> &
  NonceBindings; // TODO - KIT-4839: Remove once atomic-insight-layout migration is complete.

/**
 * The `atomic-insight-interface` component is the parent to all other atomic insight components in an insight page.
 * It handles the headless insight engine and localization configurations.
 *
 * @slot default - The default slot where you can add child components to the interface.
 * @slot full-search - A slot for components that should be positioned absolutely in the top-right corner.
 */
@customElement('atomic-insight-interface')
@withTailwindStyles
export class AtomicInsightInterface
  extends ChildrenUpdateCompleteMixin(LitElement)
  implements BaseAtomicInterface<InsightEngine>
{
  @state()
  @provide({context: bindingsContext})
  public bindings: InsightBindings = {} as InsightBindings;
  @state() public error!: Error;
  private initialized = false;
  private interfaceController = new InterfaceController<InsightEngine>(
    this,
    'CoveoAtomic',
    HEADLESS_VERSION
  );
  public store: InsightStore; // TODO - (v4) KIT-5008: Make private

  static styles: CSSResultGroup = css`
    :host {
      position: relative;
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

  // TODO - KIT-4994: add disableAnalytics prop

  // TODO - KIT-4994: deprecate in favor of disableAnalytics
  // TODO - KIT-4990: remove
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
  @property({
    type: Array,
    attribute: 'fields-to-include',
    converter: arrayConverter,
  })
  public fieldsToInclude: string[] = [];

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

  // TODO - KIT-4994 / KIT-4990: adjust
  @watch('analytics')
  public toggleAnalytics() {
    this.interfaceController.onAnalyticsChange();
  }

  @watch('iconAssetsPath')
  public updateIconAssetsPath(): void {
    this.store.state.iconAssetsPath = this.iconAssetsPath;
  }

  @watch('language')
  public updateLanguage() {
    return this.interfaceController.onLanguageChange();
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener(
      'atomic/initializeComponent',
      this.handleInitialization as EventListener
    );
  }

  @errorGuard()
  render() {
    return html`
      <slot name="full-search"></slot>
      <slot></slot>
    `;
  }

  private getBindings(): InsightBindings {
    return {
      engine: this.engine!,
      i18n: this.i18n,
      store: this.store,
      interfaceElement: this as AtomicInsightInterface,
      // TODO - KIT-4839: Remove once atomic-insight-layout migration is complete.
      createStyleElement: () => {
        const styleTag = document.createElement('style');
        return styleTag;
      },
      // TODO - KIT-4839: Remove once atomic-insight-layout migration is complete.
      createScriptElement: () => {
        const scriptTag = document.createElement('script');
        return scriptTag;
      },
    };
  }

  private handleInitialization = (event: InitializeEvent) => {
    this.interfaceController.onComponentInitializing(event);
  };

  // TODO - KIT-4994 / KIT-4990: adjust
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

  private initResultsPerPage() {
    if (!this.interfaceController.engineIsCreated(this.engine)) {
      return;
    }
    buildInsightResultsPerPage(this.bindings.engine, {
      initialState: {numberOfResults: this.resultsPerPage},
    });
  }

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
    await waitForAtomicChildrenToBeDefined(this);
    await this.getUpdateComplete();
    this.initialized = true;
  }

  // TODO - (v4) KIT-5008: Make private
  public registerFieldsToInclude() {
    if (this.fieldsToInclude.length) {
      this.engine!.dispatch(
        loadFieldActions(this.engine!).registerFieldsToInclude([
          ...this.fieldsToInclude,
        ])
      );
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-insight-interface': AtomicInsightInterface;
  }
}
