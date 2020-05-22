import {configureStore, Store} from './store';
import {HeadlessState} from '../state';
import {
  updateBasicConfiguration,
  updateSearchConfiguration,
} from '../features/configuration/configuration-actions';

export interface HeadlessOptions {
  configuration: HeadlessConfiguration;
  preloadedState?: HeadlessState;
}

export interface HeadlessConfiguration {
  organizationId: string;
  accessToken: string;
  renewAccessToken?: () => Promise<string>;
  search?: {
    searchApiBaseUrl?: string;
  };
}

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

  static getSampleConfiguration(): HeadlessConfiguration {
    return {
      organizationId: 'searchuisamples',
      accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
      search: {
        searchApiBaseUrl: 'https://platform.cloud.coveo.com/rest/search',
      },
    };
  }

  get store() {
    return this.reduxStore;
  }

  get state(): HeadlessState {
    return this.reduxStore.getState();
  }
}
