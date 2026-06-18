import type {Controller} from '../controller-types.js';
import type {
  Interface,
  Requires,
} from '@/src/core/interface/utils/interface-types.js';
import {getOrCreateResultsSelectors} from '@/src/core/internal/result-list/result-list-selectors.js';
import {getOrCreateResultsSlice} from '@/src/core/internal/result-list/result-list-slice.js';
import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {ENGINE, STATE_ID} from '@/src/core/interface/utils/symbols.js';

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

export interface ResultListControllerResult {
  uniqueId: string;
  title: string;
  uri: string;
  excerpt?: string;
  printableUri: string;
  clickUri: string;
  raw: Record<string, unknown>;
  score: number;
}

export interface ResultListControllerState {
  results: ResultListControllerResult[];
}

export interface ResultListController extends Controller {
  readonly state: ResultListControllerState;
}

export interface ResultListControllerOptions {
  interface: Interface & Requires<'search'>;
}
