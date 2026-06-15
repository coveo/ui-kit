import {getOrCreateResultsSelectors} from '@/src/core/internal/result-list/result-list-selectors.js';
import {getOrCreateResultsSlice} from '@/src/core/internal/result-list/result-list-slice.js';
import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {ENGINE, STATE_ID} from '@/src/core/interface/utils/symbols.js';
import {
  ResultListController,
  ResultListControllerOptions,
} from './result-list-controller-types.js';

export const buildResultListController = (
  options: ResultListControllerOptions
): ResultListController => {
  const engine = options.interface[ENGINE];
  const stateId = options.interface[STATE_ID];

  engine.adoptSlice(getOrCreateResultsSlice(stateId));

  const selectors = getOrCreateResultsSelectors(stateId);

  const controllerState = createMemoizedStateSelector(
    selectors.getResults,
    (results) => ({
      results: results.map((result) => ({
        uniqueId: result.uniqueId,
        title: result.title,
        uri: result.uri,
        excerpt: result.excerpt,
        printableUri: result.printableUri,
        clickUri: result.clickUri,
        raw: result.raw,
        score: result.score,
      })),
    })
  );

  return {
    get state() {
      return engine.read(controllerState);
    },
    subscribe(callback: () => void) {
      return engine.subscribe(controllerState, callback);
    },
  };
};
