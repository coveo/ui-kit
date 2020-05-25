import {configureStore, Store} from './store';
import {HeadlessState} from '../state';
import {
  updateBasicConfiguration,
  updateSearchConfiguration,
} from '../features/configuration/configuration-actions';

/**
 * The global headless engine options.
 */
export interface HeadlessOptions {
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
  preloadedState?: HeadlessState;
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

/**
 * The global headless engine.
 * You should instantiate one `Engine` class per application and share it.
 * Every headless component requires an instance of `Engine` as a parameter.
 */
export class Engine {
  private reduxStore: Store;

  constructor(options: HeadlessOptions) {
    this.reduxStore = configureStore(options.preloadedState);
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
   * Dispatches an action directly. This is the only way to trigger a state change.
   * Each headless component dispatches its own actions.
   *
   * @param action An action supported by the headless engine.
   *
   * @returns For convenience, the action object that was just dispatched.
   */
  get dispatch() {
    return this.reduxStore.dispatch;
  }

  /**
   * Adds a change listener. It will be called any time an action is
   * dispatched, and some part of the state tree may potentially have changed.
   * You may then access the new `state`.
   *
   * @param listener A callback to be invoked on every dispatch.
   * @returns A function to remove this change listener.
   */
  get subscribe() {
    return this.reduxStore.subscribe;
  }

  /**
   * @returns The complete headless state tree.
   */
  get state(): HeadlessState {
    return this.reduxStore.getState();
  }
}
