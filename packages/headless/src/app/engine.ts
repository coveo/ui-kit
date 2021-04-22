import {
  AnyAction,
  Dispatch,
  ThunkDispatch,
  Unsubscribe,
  ReducersMapObject,
  StateFromReducersMapObject,
  Middleware,
} from '@reduxjs/toolkit';
import {AnalyticsClientSendEventHook} from 'coveo.analytics';
import {debounce} from 'ts-debounce';
import {NoopPreprocessRequest} from '../api/preprocess-request';
import {SearchAPIClient} from '../api/search/search-api-client';
import {
  updateAnalyticsConfiguration,
  updateBasicConfiguration,
} from '../features/configuration/configuration-actions';
import {SearchAppState} from '../state/search-app-state';
import {validatePayloadAndThrow} from '../utils/validate-payload';
import {EngineConfigurationOptions} from './engine-configuration-options';
import {createReducerManager, ReducerManager} from './reducer-manager';
import {ThunkExtraArguments, Store, configureStore} from './store';
import {LoggerOptions} from './logger';
import {Logger} from 'pino';

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
  addReducers(reducers: ReducersMapObject): void;
}

export interface EngineOptions<Reducers extends ReducersMapObject> {
  /**
   * The global headless engine configuration options.
   */
  configuration: EngineConfigurationOptions;
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
   * The initial headless state.
   * You may optionally specify it to hydrate the state
   * from the server in universal apps, or to restore a previously serialized
   * user session.
   */
  preloadedState?: StateFromReducersMapObject<Reducers>;
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
  /**
   * The logger options.
   */
  loggerOptions?: LoggerOptions;
}

interface SearchAPIClientArgument {
  searchAPIClient: SearchAPIClient;
}

export function buildEngine<Reducers extends ReducersMapObject>(
  options: EngineOptions<Reducers>,
  thunkExtraArguments: SearchAPIClientArgument,
  logger: Logger
): Engine<StateFromReducersMapObject<Reducers>> {
  const engine = buildCoreEngine(options, thunkExtraArguments, logger);
  const {
    accessToken,
    organizationId,
    platformUrl,
    analytics,
  } = options.configuration;

  engine.dispatch(
    updateBasicConfiguration({
      accessToken,
      organizationId,
      platformUrl,
    })
  );

  if (analytics) {
    const {analyticsClientMiddleware, ...rest} = analytics;
    engine.dispatch(updateAnalyticsConfiguration(rest));
  }

  return engine;
}

function buildCoreEngine<Reducers extends ReducersMapObject>(
  options: EngineOptions<Reducers>,
  thunkExtraArguments: SearchAPIClientArgument,
  logger: Logger
): Engine<StateFromReducersMapObject<Reducers>> {
  const {configuration, reducers} = options;
  const reducerManager = createReducerManager(reducers);
  const store = createStore(
    options,
    thunkExtraArguments,
    logger,
    reducerManager
  );

  return {
    renewAccessToken: createRenewAccessTokenFunction(
      configuration,
      store.dispatch
    ),

    addReducers(reducers: ReducersMapObject) {
      reducerManager.add(reducers);
      store.replaceReducer(reducerManager.combinedReducer);
    },

    dispatch: store.dispatch,

    subscribe: store.subscribe,

    get state() {
      return store.getState();
    },

    logger,

    store,
  };
}

function createStore<Reducers extends ReducersMapObject>(
  options: EngineOptions<Reducers>,
  thunkExtraArguments: SearchAPIClientArgument,
  logger: Logger,
  reducerManager: ReducerManager
) {
  const {preloadedState, middlewares, configuration} = options;

  const analyticsClientMiddleware = getAnalyticsClientMiddleware(configuration);
  const validatePayload = validatePayloadAndThrow;
  const preprocessRequest = getPreprocessRequest(configuration);

  return configureStore({
    preloadedState,
    reducer: reducerManager.combinedReducer,
    middlewares,
    thunkExtraArguments: {
      logger,
      analyticsClientMiddleware,
      validatePayload,
      preprocessRequest,
      ...thunkExtraArguments,
    },
  });
}

function getAnalyticsClientMiddleware(
  configuration: EngineConfigurationOptions
): AnalyticsClientSendEventHook {
  const {analytics} = configuration;
  const NoopAnalyticsMiddleware = (_: string, p: any) => p;
  return analytics?.analyticsClientMiddleware || NoopAnalyticsMiddleware;
}

function getPreprocessRequest(configuration: EngineConfigurationOptions) {
  return configuration.preprocessRequest || NoopPreprocessRequest;
}

function createRenewAccessTokenFunction(
  configuration: EngineConfigurationOptions,
  dispatch: Dispatch<AnyAction>
) {
  let accessTokenRenewalsAttempts = 0;
  const resetRenewalTriesAfterDelay = debounce(
    () => (accessTokenRenewalsAttempts = 0),
    500
  );

  return async () => {
    if (!configuration.renewAccessToken) {
      return '';
    }

    accessTokenRenewalsAttempts++;
    resetRenewalTriesAfterDelay();

    if (accessTokenRenewalsAttempts > 5) {
      return '';
    }

    try {
      const accessToken = await configuration.renewAccessToken();
      dispatch(updateBasicConfiguration({accessToken}));
      return accessToken;
    } catch (error) {
      return '';
    }
  };
}
