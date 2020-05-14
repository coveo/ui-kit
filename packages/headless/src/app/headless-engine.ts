import {configureStore, Store} from './store';
import {HeadlessState} from '../state';
import {bindActionCreators} from '@reduxjs/toolkit';
import {
  updateBasicConfiguration,
  updateSearchConfiguration,
} from '../features/configuration/configuration-slice';
import {updateQuery} from '../features/query/query-slice';
import {checkForRedirection} from '../features/redirection/redirection-slice';
import {fetchQuerySuggestions} from '../features/query-suggest/query-suggest-slice';

export interface HeadlessOptions {
  configuration: HeadlessConfiguration;
}

export interface HeadlessConfiguration {
  organization: string;
  accessToken: string;
  renewAccessToken?: () => Promise<string>;
  search?: {
    endpoint?: string;
  };
}

export class Engine {
  private reduxStore: Store;

  constructor(options: HeadlessOptions) {
    this.reduxStore = configureStore();
    this.reduxStore.dispatch(updateBasicConfiguration(options.configuration));
    if (options.configuration.search) {
      this.reduxStore.dispatch(
        updateSearchConfiguration(options.configuration.search)
      );
    }
  }

  static getSampleConfiguration(): HeadlessConfiguration {
    return {
      organization: 'searchuisamples',
      accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
      search: {
        endpoint: 'https://platform.cloud.coveo.com/rest/search',
      },
    };
  }

  get store() {
    return this.reduxStore;
  }

  get state(): HeadlessState {
    return this.reduxStore.getState();
  }

  get updateQuery() {
    return bindActionCreators(updateQuery, this.reduxStore.dispatch);
  }

  get fetchQuerySuggestions() {
    return bindActionCreators(fetchQuerySuggestions, this.reduxStore.dispatch);
  }

  get checkForRedirection() {
    return bindActionCreators(checkForRedirection, this.reduxStore.dispatch);
  }
}
