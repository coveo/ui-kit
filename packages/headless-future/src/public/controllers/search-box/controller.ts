import {executeSearchAPI} from '@/src/api/index.js';
import {Engine} from '@/src/core/interface/engine/engine.js';
import {searchBoxSlice} from '@/src/core/internal/searchBox/slice.js';
import * as searchBoxSelectors from '@/src/core/interface/search-box/selectors.js';
import * as searchBoxMutators from '@/src/core/interface/search-box/mutate.js';
import {createSelector} from '@reduxjs/toolkit';

const stateSelect = createSelector([searchBoxSelectors.query], (query) => ({
  query,
}));

export const buildSearchBoxController = (engine: Engine) => {
  engine.adoptSlice(searchBoxSlice);
  return {
    updateQuery: (query: string) => {
      engine.mutate(searchBoxMutators.setQuery(query));
    },
    submit: () => {
      executeSearchAPI(engine);
    },
    get state() {
      return engine.read(stateSelect);
    },
    get query() {
      return engine.read(searchBoxSelectors.query);
    },
    subscribe(callback: () => void) {
      engine.subscribe(stateSelect, callback);
    },
  };
};
