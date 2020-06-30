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
} from '../features/configuration/configuration-actions';
import {configureStore, Store} from './store';
import {SearchPageState} from '../state';

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
   * The global headless engine configuration options specific to the SearchAPI.
   */
  search?: {
    /**
     * The Search API base URL to use (e.g., https://globalplatform.cloud.coveo.com/rest/search/v2).
     */
    searchApiBaseUrl?: string;
  };
}

export interface Engine<State = SearchPageState> {
  /**
   * Dispatches an action directly. This is the only way to trigger a state change.
   * Each headless controller dispatches its own actions.
   *
   * @param action An action supported by the headless engine.
   *
   * @returns For convenience, the action object that was just dispatched.
   */
  dispatch: ThunkDispatch<unknown, null, AnyAction> &
    ThunkDispatch<unknown, undefined, AnyAction> &
    Dispatch<AnyAction>;
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
}

/**
 * The global headless engine.
 * You should instantiate one `HeadlessEngine` class per application and share it.
 * Every headless controller requires an instance of `Engine` as a parameter.
 */
export class HeadlessEngine<Reducers extends ReducersMapObject>
  implements Engine<StateFromReducersMapObject<Reducers>> {
  private reduxStore: Store;

  constructor(options: HeadlessOptions<Reducers>) {
    this.reduxStore = configureStore({
      preloadedState: options.preloadedState,
      reducers: options.reducers,
      middlewares: options.middlewares,
    });
    this.reduxStore.dispatch(updateBasicConfiguration(options.configuration));
    if (options.configuration.search) {
      this.reduxStore.dispatch(
        updateSearchConfiguration(options.configuration.search)
      );
    }
  }

  /**
   * @returns A configuration with sample data for testing purposes.
   */
  static getSampleConfiguration(): HeadlessConfigurationOptions {
    return {
      organizationId: 'searchuisamples',
      accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
      search: {
        searchApiBaseUrl: 'https://platform.cloud.coveo.com/rest/search',
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

  get dispatch() {
    return this.reduxStore.dispatch;
  }

  get subscribe() {
    return this.reduxStore.subscribe;
  }

  get state() {
    return this.reduxStore.getState() as StateFromReducersMapObject<Reducers>;
  }
}
