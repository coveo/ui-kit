import {configureStore} from './app/store';
import {RootState} from './app/rootReducer';
import {fetchResults} from './features/results/resultsSlice';
import {Store, bindActionCreators} from 'redux';

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

  get fetchResults() {
    return bindActionCreators(fetchResults, this.store.dispatch);
  }
}

export {CoveoHeadlessEngine, RootState as CoveoHeadlessState};
