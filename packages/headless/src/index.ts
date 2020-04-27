import {configureStore} from './app/store';
import {RootState} from '@coveo/headless';
import {Store, bindActionCreators} from '@reduxjs/toolkit';
import {performSearch, SearchStatus} from './features/search/searchSlice';
import {updateQueryExpression} from './features/query/querySlice';

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

  get updateQueryExpression() {
    return bindActionCreators(updateQueryExpression, this.store.dispatch);
  }

  get performSearch() {
    return bindActionCreators(performSearch, this.store.dispatch);
  }
}

export {CoveoHeadlessEngine, RootState, SearchStatus};
