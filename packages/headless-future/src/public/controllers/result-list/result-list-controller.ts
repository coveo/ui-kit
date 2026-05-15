import {Engine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import {resultsSlice} from '@/src/core/internal/result-list/result-list-slice.js';
import * as resultsSelectors from '@/src/core/interface/result-list/result-list-selectors.js';
import {createSelector} from '@reduxjs/toolkit';
import {SearchEndpointFacade} from '@/src/api/interface/search-endpoint/search-endpoint-facade.js';
import * as resultListMiddlewares from '@/src/core/interface/result-list/result-list-middlewares.js';

const stateSelect = createSelector([resultsSelectors.results], (results) => ({
  results,
}));

export const buildResultListController = (engine: Engine) => {
  const fullEngine = getFullEngine(engine);
  const facade = SearchEndpointFacade.getInstance(fullEngine);

  facade.onResponse((response) => {
    resultListMiddlewares.searchResponseMiddleware(response);
  });

  fullEngine.adoptSlice(resultsSlice);
  return {
    get state() {
      return fullEngine.read(stateSelect);
    },
    subscribe(callback: () => void) {
      fullEngine.subscribe(stateSelect, callback);
    },
  };
};
