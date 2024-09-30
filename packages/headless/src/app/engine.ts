/* eslint-disable @typescript-eslint/no-explicit-any */
import {type Relay} from '@coveo/relay';
import {
  Dispatch,
  ThunkDispatch,
  Unsubscribe,
  ReducersMapObject,
  StateFromReducersMapObject,
  Middleware,
  Reducer,
  UnknownAction,
} from '@reduxjs/toolkit';
import {Logger} from 'pino';
import {getRelayInstanceFromState} from '../api/analytics/analytics-relay-client.js';
import {answerApi} from '../api/knowledge/stream-answer-api.js';
import {
  disableAnalytics,
  enableAnalytics,
  updateAnalyticsConfiguration,
  UpdateAnalyticsConfigurationActionCreatorPayload,
  updateBasicConfiguration,
} from '../features/configuration/configuration-actions.js';
import {
  ConfigurationState,
  CoreConfigurationState,
} from '../features/configuration/configuration-state.js';
import {versionReducer as version} from '../features/debug/version-slice.js';
import {SearchParametersState} from '../state/search-app-state.js';
import {isBrowser} from '../utils/runtime.js';
import {doNotTrack} from '../utils/utils.js';
import {analyticsMiddleware} from './analytics-middleware.js';
import {configuration} from './common-reducers.js';
import {EngineConfiguration} from './engine-configuration.js';
import {instantlyCallableThunkActionMiddleware} from './instantly-callable-middleware.js';
import {logActionErrorMiddleware} from './logger-middlewares.js';
import {LoggerOptions} from './logger.js';
import {
  NavigatorContext,
  NavigatorContextProvider,
  defaultBrowserNavigatorContextProvider,
  defaultNodeJSNavigatorContextProvider,
} from './navigatorContextProvider.js';
import {createReducerManager, ReducerManager} from './reducer-manager.js';
import {createRenewAccessTokenMiddleware} from './renew-access-token-middleware.js';
import {stateKey} from './state-key.js';
import {CoreExtraArguments, Store, configureStore} from './store.js';
import {ThunkExtraArguments} from './thunk-extra-arguments.js';

export type CoreState<
  Configuration extends CoreConfigurationState = CoreConfigurationState,
> = {
  configuration: Configuration;
  version: string;
} & Partial<SearchParametersState>;

type EngineDispatch<
  State,
  ExtraArguments extends ThunkExtraArguments,
> = ThunkDispatch<State, ExtraArguments, UnknownAction> &
  Dispatch<UnknownAction>;

export interface CoreEngine<
  State extends object = {},
  ExtraArguments extends ThunkExtraArguments = ThunkExtraArguments,
  Configuration extends CoreConfigurationState = CoreConfigurationState,
> {
  /**
   * Dispatches an action directly. This is the only way to trigger a state change.
   * Each headless controller dispatches its own actions.
   *
   * @param action An action supported by the headless engine.
   *
   * @returns For convenience, the action object that was just dispatched.
   */
  dispatch: EngineDispatch<State & CoreState<Configuration>, ExtraArguments>;
  /**
   * Adds a change listener. It will be called any time an action is
   * dispatched, and some part of the state tree may potentially have changed.
   * You may then access the new `state`.
   *
   * @param listener A callback to be invoked on every dispatch.
   * @returns A function to remove this change listener.
   */
  subscribe(listener: () => void): Unsubscribe;
  /**
   * The complete headless state tree.
   */
  state: State & CoreState<Configuration>;
  /**
   * The Relay instance used by Headless.
   */
  relay: Relay;
  /**
   * The redux store.
   */
  store: Store;
  /**
   * The logger instance used by headless.
   * */
  logger: Logger;
  /**
   * Adds the specified reducers to the store.
   *
   * @param reducers - An object containing the reducers to attach to the engine.
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
  /**
   * The navigator context (referer, location, UserAgent)
   */
  navigatorContext: NavigatorContext;
}

export type CoreEngineNext<
  State extends object = {},
  ExtraArguments extends ThunkExtraArguments = ThunkExtraArguments,
  Configuration extends CoreConfigurationState = CoreConfigurationState,
> = Omit<CoreEngine<State, ExtraArguments>, 'state' | 'store'> & {
  /**
   * The readonly internal state of the headless engine.
   *
   * @internal
   */
  readonly [stateKey]: State & CoreState<Configuration>;

  /**
   * The readonly global headless engine configuration
   */
  readonly configuration: Configuration;
};

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
  /**
   * An optional cross reducer (aka: root reducer) that can be combined with the slice reducers.
   *
   * [Redux documentation on root reducers.](https://redux.js.org/usage/structuring-reducers/beyond-combinereducers)
   */
  crossReducer?: Reducer;
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
   *
   * @example
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
  /**
   * An optional function returning navigation context. (referer, location, UserAgent)
   */
  navigatorContextProvider?: NavigatorContextProvider;
}

function getUpdateAnalyticsConfigurationPayload(
  configuration: EngineConfiguration,
  logger: Logger
): UpdateAnalyticsConfigurationActionCreatorPayload | null {
  const {analytics} = configuration;
  const {analyticsClientMiddleware: _, ...payload} = analytics ?? {};

  const payloadWithURL = {
    ...payload,
    ...(analytics?.proxyBaseUrl && {
      apiBaseUrl: analytics.proxyBaseUrl,
      nexApiBaseUrl: analytics.proxyBaseUrl,
    }),
  };

  // TODO KIT-2844
  if (payloadWithURL.analyticsMode !== 'next' && doNotTrack()) {
    logger.info('Analytics disabled since doNotTrack is active.');
    return {
      ...payloadWithURL,
      enabled: false,
    };
  }

  if (payloadWithURL.analyticsMode === 'next' && !payload.trackingId) {
    throw new InvalidEngineConfiguration(
      'analytics.trackingId is required when analytics.analyticsMode="next"'
    );
  }

  return payloadWithURL;
}

export function buildEngine<
  Reducers extends ReducersMapObject,
  ExtraArguments extends ThunkExtraArguments,
>(
  options: EngineOptions<Reducers>,
  thunkExtraArguments: ExtraArguments
): CoreEngine<
  StateFromReducersMapObject<Reducers>,
  CoreExtraArguments & ExtraArguments,
  ConfigurationState
> {
  const reducers = {
    ...options.reducers,
    configuration,
    version,
  };
  const engine = buildCoreEngine(
    {...options, reducers},
    thunkExtraArguments,
    configuration
  );
  const {accessToken, environment, organizationId} = options.configuration;

  engine.dispatch(
    updateBasicConfiguration({
      accessToken,
      environment,
      organizationId,
    })
  );

  const analyticsPayload = getUpdateAnalyticsConfigurationPayload(
    options.configuration,
    engine.logger
  );
  if (analyticsPayload) {
    engine.dispatch(updateAnalyticsConfiguration(analyticsPayload));
  }

  return engine;
}

export function buildCoreEngine<
  Reducers extends ReducersMapObject,
  ExtraArguments extends ThunkExtraArguments,
  Configuration extends CoreConfigurationState,
>(
  options: EngineOptions<Reducers>,
  thunkExtraArguments: ExtraArguments,
  configurationReducer: Reducer<Configuration>
): CoreEngine<
  StateFromReducersMapObject<Reducers>,
  ExtraArguments,
  Configuration
> {
  const {reducers} = options;
  const reducerManager = createReducerManager(
    {...reducers, configurationReducer},
    options.preloadedState ?? {}
  );
  if (options.crossReducer) {
    reducerManager.addCrossReducer(options.crossReducer);
  }
  const logger = thunkExtraArguments.logger;
  const getClientId = () => {
    let clientId = '';
    try {
      clientId = getRelayInstanceFromState(engine.state).getMeta('').clientId;
    } catch (e) {
      logger.warn('Error while obtaining clientID from relay', e);
    }
    return clientId;
  };
  const thunkExtraArgumentsWithRelay: CoreExtraArguments & ExtraArguments = {
    ...thunkExtraArguments,
    get relay() {
      return getRelayInstanceFromState(engine.state);
    },
    get navigatorContext() {
      if (options.navigatorContextProvider) {
        return options.navigatorContextProvider();
      }
      if (!isBrowser()) {
        return defaultNodeJSNavigatorContextProvider();
      }

      return defaultBrowserNavigatorContextProvider(getClientId());
    },
  };
  const store = createStore(
    options,
    thunkExtraArgumentsWithRelay,
    reducerManager
  );

  const engine = {
    addReducers(reducers: ReducersMapObject) {
      if (reducerManager.containsAll(reducers)) {
        return;
      }

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

    get relay() {
      return getRelayInstanceFromState(this.state);
    },

    get navigatorContext() {
      if (options.navigatorContextProvider) {
        return options.navigatorContextProvider();
      }
      if (!isBrowser()) {
        return defaultNodeJSNavigatorContextProvider();
      }

      return defaultBrowserNavigatorContextProvider(getClientId());
    },

    logger,

    store,
  };
  return engine;
}

function createStore<
  Reducers extends ReducersMapObject,
  ExtraArguments extends CoreExtraArguments,
>(
  options: EngineOptions<Reducers>,
  thunkExtraArguments: ExtraArguments,
  reducerManager: ReducerManager
) {
  const {preloadedState, configuration} = options;
  const name = configuration.name || 'coveo-headless';
  const middlewares = createMiddleware(options, thunkExtraArguments.logger);

  return configureStore({
    preloadedState,
    reducer: reducerManager.combinedReducer,
    middlewares,
    thunkExtraArguments,
    name,
  });
}

function createMiddleware<Reducers extends ReducersMapObject>(
  options: EngineOptions<Reducers>,
  logger: Logger
) {
  const {renewAccessToken} = options.configuration;
  const renewTokenMiddleware = createRenewAccessTokenMiddleware(
    logger,
    renewAccessToken
  );

  return [
    instantlyCallableThunkActionMiddleware,
    renewTokenMiddleware,
    logActionErrorMiddleware(logger),
    analyticsMiddleware,
  ].concat(answerApi.middleware, options.middlewares || []);
}

class InvalidEngineConfiguration extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidEngineConfiguration';
  }
}
