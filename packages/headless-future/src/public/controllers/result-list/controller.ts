import {Engine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import {resultSlice} from '@/src/core/internal/result/slice.js';
import * as resultsSelectors from '@/src/core/interface/results/selectors.js';
import {createSelector} from '@reduxjs/toolkit';

const stateSelect = createSelector([resultsSelectors.results], (results) => ({
  results,
}));

export const buildResultListController = (engine: Engine) => {
  const fullEngine = getFullEngine(engine);
  fullEngine.adoptSlice(resultSlice);
  return {
    get state() {
      return fullEngine.read(stateSelect);
    },
    subscribe(callback: () => void) {
      fullEngine.subscribe(stateSelect, callback);
    },
  };
};
