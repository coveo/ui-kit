import {configureStore} from './store';
import {
  HeadlessState,
  HeadlessOptions,
  HeadlessConfiguration,
} from '@coveo/headless';
import {Store, bindActionCreators} from '@reduxjs/toolkit';
import {
  updateBasicConfiguration,
  updateSearchConfiguration,
} from '../features/configuration/configuration-slice';
import {updateQuery} from '../features/query/query-slice';
import {checkForRedirection} from '../features/redirection/redirection-slice';

export class CoveoHeadlessEngine {
  private reduxStore: Store<HeadlessState>;

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

  get checkForRedirection() {
    return bindActionCreators(checkForRedirection, this.reduxStore.dispatch);
  }
}
