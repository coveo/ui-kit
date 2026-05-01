import {executeSearchAPI} from '@/src/api/index.js';
import {Engine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import {searchBoxSlice} from '@/src/core/internal/searchBox/slice.js';
import * as searchBoxSelectors from '@/src/core/interface/search-box/selectors.js';
import * as searchBoxMutators from '@/src/core/interface/search-box/mutate.js';
import {createSelector} from '@reduxjs/toolkit';

const stateSelect = createSelector([searchBoxSelectors.query], (query) => ({
  query,
}));

export const buildSearchBoxController = (engine: Engine) => {
  const fullEngine = getFullEngine(engine);
  fullEngine.adoptSlice(searchBoxSlice);
  return {
    updateQuery: (query: string) => {
      fullEngine.mutate(searchBoxMutators.setQuery(query));
    },
    submit: () => {
      executeSearchAPI(fullEngine);
    },
    get state() {
      return fullEngine.read(stateSelect);
    },
    get query() {
      return fullEngine.read(searchBoxSelectors.query);
    },
    subscribe(callback: () => void) {
      fullEngine.subscribe(stateSelect, callback);
    },
  };
};
