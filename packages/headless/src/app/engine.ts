import {
  AnyAction,
  Dispatch,
  ThunkDispatch,
  Unsubscribe,
  ReducersMapObject,
  StateFromReducersMapObject,
  Middleware,
} from '@reduxjs/toolkit';
import {debounce} from 'ts-debounce';
import {
  disableAnalytics,
  enableAnalytics,
  updateAnalyticsConfiguration,
  updateBasicConfiguration,
} from '../features/configuration/configuration-actions';
import {EngineConfiguration} from './engine-configuration-options';
import {createReducerManager, ReducerManager} from './reducer-manager';
import {Store, configureStore} from './store';
import {LoggerOptions} from './logger';
import {Logger} from 'pino';
import {ThunkExtraArguments} from './thunk-extra-arguments';
import {configuration, version} from './reducers';

const coreReducers = {configuration, version};
type CoreState = StateFromReducersMapObject<typeof coreReducers>;

type EngineDispatch<
  State,
  ExtraArguments extends ThunkExtraArguments
> = ThunkDispatch<State, ExtraArguments, AnyAction> & Dispatch<AnyAction>;

export interface CoreEngine<
  /**
   * @deprecated For v1, restrict "State" generic by extending "object". e.g. State extends object = {}
   */
  State = {},
  ExtraArguments extends ThunkExtraArguments = ThunkExtraArguments
> {
  /**
   * Dispatches an action directly. This is the only way to trigger a state change.
   * Each headless controller dispatches its own actions.
   *
   * @param action An action supported by the headless engine.
   *
   * @returns For convenience, the action object that was just dispatched.
   */
  dispatch: EngineDispatch<State & CoreState, ExtraArguments>;
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
  state: State & CoreState;
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
  /**
   * Enable analytics tracking
   */
  enableAnalytics(): void;
  /**
   * Disable analytics tracking
   */
  disableAnalytics(): void;
}

export interface EngineOptions<Reducers extends ReducersMapObject>
  extends ExternalEngineOptions<StateFromReducersMapObject<Reducers>> {
  /**
   * Map object of reducers.
   * A reducer is a pure function that takes the previous state and an action, and returns the next state.
   * ```
   * (previousState, action) => nextState
   * ```
   * [Redux documentation on reducers.](https://redux.js.org/glossary#reducer)
   */
  reducers: Reducers;
}

export interface ExternalEngineOptions<State extends object> {
  /**
   * The global headless engine configuration options.
   */
  configuration: EngineConfiguration;

  /**
   * The initial headless state.
   * You may optionally specify it to hydrate the state
   * from the server in universal apps, or to restore a previously serialized
   * user session.
   */
  preloadedState?: State;
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
  middlewares?: Middleware<{}, State>[];
  /**
   * The logger options.
   */
  loggerOptions?: LoggerOptions;
}

export function buildEngine<
  Reducers extends ReducersMapObject,
  ExtraArguments extends ThunkExtraArguments
>(
  options: EngineOptions<Reducers>,
  thunkExtraArguments: ExtraArguments
): CoreEngine<StateFromReducersMapObject<Reducers>, ExtraArguments> {
  const engine = buildCoreEngine(options, thunkExtraArguments);
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

function buildCoreEngine<
  Reducers extends ReducersMapObject,
  ExtraArguments extends ThunkExtraArguments
>(
  options: EngineOptions<Reducers>,
  thunkExtraArguments: ExtraArguments
): CoreEngine<StateFromReducersMapObject<Reducers>, ExtraArguments> {
  const {configuration, reducers} = options;
  const reducerManager = createReducerManager({...coreReducers, ...reducers});
  const logger = thunkExtraArguments.logger;
  const store = createStore(options, thunkExtraArguments, reducerManager);

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

    enableAnalytics() {
      store.dispatch(enableAnalytics());
    },

    disableAnalytics() {
      store.dispatch(disableAnalytics());
    },

    get state() {
      return store.getState();
    },

    logger,

    store,
  };
}

function createStore<
  Reducers extends ReducersMapObject,
  ExtraArguments extends ThunkExtraArguments
>(
  options: EngineOptions<Reducers>,
  thunkExtraArguments: ExtraArguments,
  reducerManager: ReducerManager
) {
  const {preloadedState, middlewares, configuration} = options;
  const name = configuration.name || 'coveo-headless';

  return configureStore({
    preloadedState,
    reducer: reducerManager.combinedReducer,
    middlewares,
    thunkExtraArguments,
    name,
  });
}

function createRenewAccessTokenFunction(
  configuration: EngineConfiguration,
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
