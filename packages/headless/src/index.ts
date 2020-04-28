import {configureStore} from './app/store';
import {RootState} from '@coveo/headless';
import {Store, bindActionCreators} from '@reduxjs/toolkit';
import {launchSearch, SearchStatus} from './features/search/search-slice';
import {updateQuery} from './features/query/query-slice';

class CoveoHeadlessEngine {
  private store: Store<RootState>;
  constructor() {
    this.store = configureStore();
  }

  get reduxStore() {
    return this.store;
  }

  get state(): RootState {
    return this.store.getState();
  }

  get updateQuery() {
    return bindActionCreators(updateQuery, this.store.dispatch);
  }

  get performSearch() {
    return bindActionCreators(launchSearch, this.store.dispatch);
  }
}

export {CoveoHeadlessEngine, RootState, SearchStatus};
