import {getFullEngine} from '@/src/core/interface/engine/engine.js';
import {loadResultList} from '@/src/core/index.js';
import * as resultsSelectors from '@/src/core/interface/result-list/result-list-selectors.js';
import {createSelector} from '@reduxjs/toolkit';
import {
  ResultListController,
  ResultListControllerOptions,
  ResultListControllerState,
} from './result-list-controller-types.js';

const stateSelect = createSelector(
  [resultsSelectors.results],
  (results): ResultListControllerState => ({
    results: results.map((result) => ({
      id: result.id,
      title: result.title,
      uri: result.uri,
      excerpt: result.excerpt,
    })),
  })
);

export const buildResultListController = (
  options: ResultListControllerOptions
): ResultListController => {
  const {engine} = options;
  const fullEngine = getFullEngine(engine);
  loadResultList(fullEngine);

  return {
    get state() {
      return fullEngine.read(stateSelect);
    },
    subscribe(callback: () => void) {
      return fullEngine.subscribe(stateSelect, callback);
    },
  };
};
