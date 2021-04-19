import {
  AnyAction,
  Dispatch,
  ThunkDispatch,
  Unsubscribe,
  ReducersMapObject,
  StateFromReducersMapObject,
  Middleware,
} from '@reduxjs/toolkit';
import {
  AnalyticsClientSendEventHook,
  IRuntimeEnvironment,
} from 'coveo.analytics';
import {LevelWithSilent, Logger, LogEvent} from 'pino';
import {PreprocessRequest} from '../api/preprocess-request';
import {SearchAppState} from '../state/search-app-state';
import {ThunkExtraArguments, Store} from './store';

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

export interface CoreOptions<Reducers extends ReducersMapObject> {
  /**
   * The global headless engine configuration options.
   */
  configuration: CoreConfigurationOptions;
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
export interface CoreConfigurationOptions {
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
   * Allows configuring options related to analytics.
   */
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

export function buildCoreEngine() {}
