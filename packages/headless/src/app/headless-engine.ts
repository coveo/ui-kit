import {ReducersMapObject, StateFromReducersMapObject} from '@reduxjs/toolkit';
import {
  updateBasicConfiguration,
  updateSearchConfiguration,
  disableAnalytics,
  enableAnalytics,
  updateAnalyticsConfiguration,
  localeValidation,
} from '../features/configuration/configuration-actions';
import {configureStore, Store} from './store';
import {SearchAPIClient} from '../api/search/search-api-client';
import {debounce} from 'ts-debounce';
import pino, {Logger} from 'pino';
import {
  NoopPreprocessRequestMiddleware,
  PreprocessRequestMiddleware,
} from '../api/platform-client';
import {NoopPreprocessRequest} from '../api/preprocess-request';
import {BooleanValue, RecordValue, Schema, StringValue} from '@coveo/bueno';
import {validatePayloadAndThrow} from '../utils/validate-payload';
import {
  NoopPostprocessFacetSearchResponseMiddleware,
  NoopPostprocessQuerySuggestResponseMiddleware,
  NoopPostprocessSearchResponseMiddleware,
  PostprocessFacetSearchResponseMiddleware,
  PostprocessQuerySuggestResponseMiddleware,
  PostprocessSearchResponseMiddleware,
} from '../api/search/search-api-client-middleware';
import {AnalyticsClientSendEventHook} from 'coveo.analytics';
import {createReducerManager, ReducerManager} from './reducer-manager';
import {Engine, CoreOptions, CoreConfigurationOptions} from './core-engine';

/**
 * The global headless engine options.
 */
export interface HeadlessOptions<Reducers extends ReducersMapObject>
  extends CoreOptions<Reducers> {
  /**
   * The global headless engine configuration options.
   */
  configuration: HeadlessConfigurationOptions;
}

/**
 * The global headless engine configuration options.
 */
export interface HeadlessConfigurationOptions extends CoreConfigurationOptions {
  /**
   * The global headless engine configuration options specific to the SearchAPI.
   */
  search?: {
    /**
     * Specifies the name of the query pipeline to use for the query. If not specified, the default query pipeline will be used.
     */
    pipeline?: string;
    /**
     * The first level of origin of the request, typically the identifier of the graphical search interface from which the request originates.
     * Coveo Machine Learning models use this information to provide contextually relevant output.
     * Notes:
     *    This parameter will be overridden if the search request is authenticated by a search token that enforces a specific searchHub.
     *    When logging a Search usage analytics event for a query, the originLevel1 field of that event should be set to the value of the searchHub search request parameter.
     */
    searchHub?: string;
    /**
     * The locale of the current user. Must comply with IETF’s BCP 47 definition: https://www.rfc-editor.org/rfc/bcp/bcp47.txt.
     *
     * Notes:
     *  Coveo Machine Learning models use this information to provide contextually relevant output.
     *  Moreover, this information can be referred to in query expressions and QPL statements by using the $locale object.
     */
    locale?: string;
    /**
     * Allows for augmenting a request (search, facet-search, query-suggest, etc.) before it is sent.
     * @deprecated Use `preprocessRequest` instead.
     */
    preprocessRequestMiddleware?: PreprocessRequestMiddleware;
    /**
     * Allows for augmenting a search response before the state is updated.
     */
    preprocessSearchResponseMiddleware?: PostprocessSearchResponseMiddleware;
    /**
     * Allows for augmenting a facet-search response before the state is updated.
     */
    preprocessFacetSearchResponseMiddleware?: PostprocessFacetSearchResponseMiddleware;
    /**
     * Allows for augmenting a query-suggest response before the state is updated.
     */
    preprocessQuerySuggestResponseMiddleware?: PostprocessQuerySuggestResponseMiddleware;
  };
}

/**
 * The global headless engine.
 * You should instantiate one `HeadlessEngine` class per application and share it.
 * Every headless controller requires an instance of `Engine` as a parameter.
 */
export class HeadlessEngine<Reducers extends ReducersMapObject>
  implements Engine<StateFromReducersMapObject<Reducers>> {
  private reduxStore!: Store;
  public logger!: Logger;
  private reducerManager!: ReducerManager;

  constructor(private options: HeadlessOptions<Reducers>) {
    this.initLogger();
    this.validateConfiguration(options);
    this.initReducerManager();
    this.initStore();

    this.reduxStore.dispatch(
      updateBasicConfiguration({
        accessToken: options.configuration.accessToken,
        platformUrl: options.configuration.platformUrl,
        organizationId: options.configuration.organizationId,
      })
    );
    if (options.configuration.search) {
      this.reduxStore.dispatch(
        updateSearchConfiguration(options.configuration.search)
      );
    }
    if (options.configuration.analytics) {
      const {
        analyticsClientMiddleware,
        ...rest
      } = options.configuration.analytics;
      this.reduxStore.dispatch(updateAnalyticsConfiguration(rest));
    }
  }

  public addReducers(reducers: ReducersMapObject) {
    this.reducerManager.add(reducers);
    this.reduxStore.replaceReducer(this.reducerManager.combinedReducer);
  }

  private validateConfiguration(options: HeadlessOptions<Reducers>) {
    if (options.configuration.search?.preprocessRequestMiddleware) {
      this.logger
        .warn(`The "search.preprocessRequestMiddleware" configuration option is now deprecated and will be removed in the upcoming @coveo/headless major version.
      Please use the "preprocessRequest" option instead, which works for both the Search and Analytics API requests.`);
    }
    const configurationSchema = new Schema<HeadlessConfigurationOptions>({
      organizationId: new StringValue({
        required: true,
        emptyAllowed: false,
      }),
      accessToken: new StringValue({
        required: true,
        emptyAllowed: false,
      }),
      platformUrl: new StringValue({
        required: false,
        emptyAllowed: false,
      }),
      search: new RecordValue({
        options: {
          required: false,
        },
        values: {
          pipeline: new StringValue({
            required: false,
            emptyAllowed: false,
          }),
          searchHub: new StringValue({
            required: false,
            emptyAllowed: false,
          }),
          locale: localeValidation,
        },
      }),
      analytics: new RecordValue({
        options: {
          required: false,
        },
        values: {
          enabled: new BooleanValue({
            required: false,
          }),
          originLevel2: new StringValue({
            required: false,
          }),
          originLevel3: new StringValue({
            required: false,
          }),
        },
      }),
    });
    try {
      configurationSchema.validate(options.configuration);
    } catch (error) {
      this.logger.error(error, 'Headless engine configuration error');
      throw error;
    }
  }

  private initLogger() {
    this.logger = pino({
      name: '@coveo/headless',
      level: this.options.loggerOptions?.level || 'warn',
      formatters: {
        log: this.options.loggerOptions?.logFormatter,
      },
      browser: {
        transmit: {
          send: this.options.loggerOptions?.browserPostLogHook || (() => {}),
        },
      },
    });
  }

  private initReducerManager() {
    this.reducerManager = createReducerManager(this.options.reducers);
  }

  private initStore() {
    const {search} = this.options.configuration;
    const preprocessRequest =
      this.options.configuration.preprocessRequest || NoopPreprocessRequest;
    this.reduxStore = configureStore({
      preloadedState: this.options.preloadedState,
      reducer: this.reducerManager.combinedReducer,
      middlewares: this.options.middlewares,
      thunkExtraArguments: {
        searchAPIClient: new SearchAPIClient({
          logger: this.logger,
          renewAccessToken: () => this.renewAccessToken(),
          preprocessRequest,
          deprecatedPreprocessRequest:
            search?.preprocessRequestMiddleware ||
            NoopPreprocessRequestMiddleware,
          postprocessSearchResponseMiddleware:
            search?.preprocessSearchResponseMiddleware ||
            NoopPostprocessSearchResponseMiddleware,
          postprocessFacetSearchResponseMiddleware:
            search?.preprocessFacetSearchResponseMiddleware ||
            NoopPostprocessFacetSearchResponseMiddleware,
          postprocessQuerySuggestResponseMiddleware:
            search?.preprocessQuerySuggestResponseMiddleware ||
            NoopPostprocessQuerySuggestResponseMiddleware,
        }),
        analyticsClientMiddleware: this.analyticsClientMiddleware(this.options),
        logger: this.logger,
        validatePayload: validatePayloadAndThrow,
        preprocessRequest,
      },
    });
  }

  /**
   * @returns A configuration with sample data for testing purposes.
   */
  static getSampleConfiguration(): HeadlessConfigurationOptions {
    return {
      organizationId: 'searchuisamples',
      accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
      search: {
        pipeline: 'default',
        searchHub: 'default',
      },
    };
  }

  /**
   * Enable analytics tracking
   */
  public enableAnalytics() {
    this.dispatch(enableAnalytics());
  }

  /**
   * Disable analytics tracking
   */
  public disableAnalytics() {
    this.dispatch(disableAnalytics());
  }

  get store() {
    return this.reduxStore;
  }

  get dispatch(): EngineDispatch<StateFromReducersMapObject<Reducers>> {
    return this.reduxStore.dispatch;
  }

  get subscribe() {
    return this.reduxStore.subscribe;
  }

  get state() {
    return this.reduxStore.getState() as StateFromReducersMapObject<Reducers>;
  }

  private accessTokenRenewalsAttempts = 0;

  private resetRenewalTriesAfterDelay = debounce(
    () => (this.accessTokenRenewalsAttempts = 0),
    500
  );

  public async renewAccessToken() {
    if (!this.options.configuration.renewAccessToken) {
      return '';
    }

    this.accessTokenRenewalsAttempts++;
    this.resetRenewalTriesAfterDelay();
    if (this.accessTokenRenewalsAttempts > 5) {
      return '';
    }

    try {
      const accessToken = await this.options.configuration.renewAccessToken();
      this.dispatch(updateBasicConfiguration({accessToken}));
      return accessToken;
    } catch (error) {
      return '';
    }
  }

  private analyticsClientMiddleware(
    options: HeadlessOptions<Reducers>
  ): AnalyticsClientSendEventHook {
    return (
      options.configuration.analytics?.analyticsClientMiddleware ||
      ((_, p) => p)
    );
  }
}
