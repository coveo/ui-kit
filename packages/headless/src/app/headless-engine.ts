import {
  Unsubscribe,
  ThunkDispatch,
  AnyAction,
  Dispatch,
  ReducersMapObject,
  StateFromReducersMapObject,
  Middleware,
} from '@reduxjs/toolkit';
import {
  updateBasicConfiguration,
  updateSearchConfiguration,
  disableAnalytics,
  enableAnalytics,
  updateAnalyticsConfiguration,
  localeValidation,
} from '../features/configuration/configuration-actions';
import {configureStore, Store, ThunkExtraArguments} from './store';
import {SearchAPIClient} from '../api/search/search-api-client';
import {debounce} from 'ts-debounce';
import {SearchAppState} from '../state/search-app-state';
import pino, {Logger, LogEvent, LevelWithSilent} from 'pino';
import {
  NoopPreprocessRequestMiddleware,
  PreprocessRequestMiddleware,
} from '../api/platform-client';
import {
  PreprocessRequest,
  NoopPreprocessRequest,
} from '../api/preprocess-request';
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
import {
  AnalyticsClientSendEventHook,
  IRuntimeEnvironment,
} from 'coveo.analytics';
import {createReducerManager, ReducerManager} from './reducer-manager';

export type LogLevel = LevelWithSilent;

/**
 * The global headless engine options.
 */
export interface HeadlessOptions<Reducers extends ReducersMapObject> {
  /**
   * The global headless engine configuration options.
   */
  configuration: HeadlessConfigurationOptions;
  /**
   * The initial headless state.
   * You may optionally specify it to hydrate the state
   * from the server in universal apps, or to restore a previously serialized
   * user session.
   */
  preloadedState?: StateFromReducersMapObject<Reducers>;
  /**
   * Map object of reducers.
   * A reducer is a pure function that takes the previous state and an action, and returns the next state.
   * ```
   * (previousState, action) => nextState
   * ```
   * [Redux documentation on reducers.](https://redux.js.org/glossary#reducer)
   */
  reducers: Reducers;
  /**
   * List of additional middlewares.
   * A middleware is a higher-order function that composes a dispatch function to return a new dispatch function.
   * It is useful for logging actions, performing side effects like routing, or turning an asynchronous API call into a series of synchronous actions.
   * ```
   * type MiddlewareAPI = { dispatch: Dispatch, getState: () => State }
   * type Middleware = (api: MiddlewareAPI) => (next: Dispatch) => Dispatch
   * ```
   * [Redux documentation on middlewares.](https://redux.js.org/glossary#middleware)
   */
  middlewares?: Middleware<{}, StateFromReducersMapObject<Reducers>>[];
  loggerOptions?: {
    /**
     * By default, is set to `warn`.
     */
    level?: LogLevel;
    /**
     * Changes the shape of the log object. This function will be called every time one of the log methods (such as `.info`) is called.
     * All arguments passed to the log method, except the message, will be pass to this function. By default it does not change the shape of the log object.
     */
    logFormatter?: (object: object) => object;
    /**
     * Function which will be called after writing the log message in the browser.
     */
    browserPostLogHook?: (level: LogLevel, logEvent: LogEvent) => void;
  };
}

/**
 * The global headless engine configuration options.
 */
export interface HeadlessConfigurationOptions {
  /**
   * The unique identifier of the target Coveo Cloud organization (e.g., `mycoveocloudorganizationg8tp8wu3`)
   */
  organizationId: string;
  /**
   * The access token to use to authenticate requests against the Coveo Cloud endpoints. Typically, this will be an API key or search token that grants the privileges to execute queries and push usage analytics data in the target Coveo Cloud organization.
   */
  accessToken: string;
  /**
   * A function that fetches a new access token. The function must return a Promise that resolves to a string (the new access token).
   */
  renewAccessToken?: () => Promise<string>;
  /**
   * Allows for augmenting a Platform request before it is sent.
   * @param request Request to be augmented
   * @param clientOrigin The origin of the client, can be "analyticsFetch", "analyticsBeacon" or "searchApiFetch"
   *
   * @returns Augmented request
   */
  preprocessRequest?: PreprocessRequest;
  /**
   * The Plaform URL to use. (e.g., https://platform.cloud.coveo.com)
   * The platformUrl() helper method can be useful to know what url is available.
   */
  platformUrl?: string;
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

  analytics?: {
    /**
     * Specifies if usage analytics tracking should be enabled.
     *
     * By default, all analytics events will be logged.
     */
    enabled?: boolean;
    /**
     * Origin level 2 is a usage analytics event metadata whose value should typically be the name/identifier of the tab from which the usage analytics event originates.
     *
     * When logging a Search usage analytics event, originLevel2 should always be set to the same value as the corresponding tab (parameter) Search API query parameter so Coveo Machine Learning models function properly, and usage analytics reports and dashboards are coherent.
     *
     * This value is optional, and will automatically try to resolve itself from the tab search parameter.
     */
    originLevel2?: string;
    /**
     * Origin level 3 is a usage analytics event metadata whose value should typically be the URL of the page that linked to the search interface that’s making the request.
     *
     * When logging a Search usage analytics event, originLevel3 should always be set to the same value as the corresponding referrer Search API query parameter so usage analytics reports and dashboards are coherent.
     *
     * This value is optional, and will automatically try to resolve itself from the referrer search parameter.
     */
    originLevel3?: string;
    /**
     * analyticsClientMiddleware allows to hook into an analytics event payload before it is sent to the Coveo platform.
     */
    analyticsClientMiddleware?: AnalyticsClientSendEventHook;
    /**
     * Optional analytics runtime environment, this is needed for analytics to work correctly if you're running outside of a browser.
     * See https://github.com/coveo/coveo.analytics.js for more info.
     */
    runtimeEnvironment?: IRuntimeEnvironment;
  };
}

type EngineDispatch<State> = ThunkDispatch<
  State,
  ThunkExtraArguments,
  AnyAction
> &
  Dispatch<AnyAction>;

export interface Engine<State = SearchAppState> {
  /**
   * Dispatches an action directly. This is the only way to trigger a state change.
   * Each headless controller dispatches its own actions.
   *
   * @param action An action supported by the headless engine.
   *
   * @returns For convenience, the action object that was just dispatched.
   */
  dispatch: EngineDispatch<State>;
  /**
   * Adds a change listener. It will be called any time an action is
   * dispatched, and some part of the state tree may potentially have changed.
   * You may then access the new `state`.
   *
   * @param listener A callback to be invoked on every dispatch.
   * @returns A function to remove this change listener.
   */
  subscribe: (listener: () => void) => Unsubscribe;
  /**
   * The complete headless state tree.
   */
  state: State;
  /**
   * The redux store.
   */
  store: Store;
  /**
   * A function for headless to call to retrieve a refreshed access token.
   */
  renewAccessToken: () => Promise<string>;
  /**
   * The logger instance used by headless.
   * */
  logger: Logger;
  /**
   * Adds the specified reducers to the store.
   */
  addReducers(reducerMap: ReducersMapObject): void;
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
    this.initReducerManger();
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
    this.reduxStore.replaceReducer(this.reducerManager.reducer);
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

  private initReducerManger() {
    this.reducerManager = createReducerManager(this.options.reducers);
  }

  private initStore() {
    const {search} = this.options.configuration;
    const preprocessRequest =
      this.options.configuration.preprocessRequest || NoopPreprocessRequest;
    this.reduxStore = configureStore({
      preloadedState: this.options.preloadedState,
      reducer: this.reducerManager.reducer,
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
