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
import pino, {LevelWithSilent, Logger, LogEvent} from 'pino';
import {debounce} from 'ts-debounce';
import {NoopPreprocessRequest} from '../api/preprocess-request';
import {updateBasicConfiguration} from '../features/configuration/configuration-actions';
import {SearchAppState} from '../state/search-app-state';
import {validatePayloadAndThrow} from '../utils/validate-payload';
import {EngineConfigurationOptions} from './engine-configuration-options';
import {createReducerManager, ReducerManager} from './reducer-manager';
import {ThunkExtraArguments, Store, configureStore} from './store';

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

export type LogLevel = LevelWithSilent;

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
  loggerOptions?: LoggerOptions;
}

interface LoggerOptions {
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
}

export function buildEngine<Reducers extends ReducersMapObject>(
  options: EngineOptions<Reducers>,
  thunkExtraArguments: ThunkExtraArguments
): Engine {
  const {configuration, loggerOptions, reducers} = options;
  const logger = createLogger(loggerOptions);
  const reducerManager = createReducerManager(reducers);
  const store = createStore(
    options,
    thunkExtraArguments,
    logger,
    reducerManager
  );
  const renewAccessToken = createRenewAccessTokenFunction(
    configuration,
    store.dispatch
  );

  return {
    logger,

    renewAccessToken,

    addReducers(reducers: ReducersMapObject) {
      reducerManager.add(reducers);
      store.replaceReducer(reducerManager.combinedReducer);
    },

    get dispatch(): EngineDispatch<StateFromReducersMapObject<Reducers>> {
      return store.dispatch;
    },

    get state() {
      return store.getState();
    },

    get store() {
      return store;
    },

    get subscribe() {
      return store.subscribe;
    },
  };
}

function createLogger(options: LoggerOptions | undefined) {
  return pino({
    name: '@coveo/headless',
    level: options?.level || 'warn',
    formatters: {
      log: options?.logFormatter,
    },
    browser: {
      transmit: {
        send: options?.browserPostLogHook || (() => {}),
      },
    },
  });
}

function createStore<Reducers extends ReducersMapObject>(
  options: EngineOptions<Reducers>,
  thunkExtraArguments: ThunkExtraArguments,
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
    },
  });
}

function getAnalyticsClientMiddleware(
  configuration: EngineConfigurationOptions
): AnalyticsClientSendEventHook {
  const {analytics} = configuration;
  return analytics?.analyticsClientMiddleware || ((_, p) => p);
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
