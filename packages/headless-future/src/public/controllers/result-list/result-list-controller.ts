import {Engine} from '@/src/core/interface/engine/engine.js';
import {resultSlice} from '@/src/core/internal/result/result-slice.js';
import * as resultsSelectors from '@/src/core/interface/results/results-selectors.js';
import {createSelector} from '@reduxjs/toolkit';

const stateSelect = createSelector([resultsSelectors.results], (results) => ({
  results,
}));

export const buildResultListController = (engine: Engine) => {
  engine.adoptSlice(resultSlice);
  return {
    get state() {
      return engine.read(stateSelect);
    },
    subscribe(callback: () => void) {
      engine.subscribe(stateSelect, callback);
    },
  };
};
